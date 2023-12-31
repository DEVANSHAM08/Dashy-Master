import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { client } from "../../lib/sanityClient";
import imageUrlBuilder from "@sanity/image-url";

// Get a pre-configured url-builder from your sanity client
const builder = imageUrlBuilder(client);

export const useDashy = () => {
  const [avatar, setAvatar] = useState(
    "https://certchain.infura-ipfs.io/ipfs/Qmf5tiCy77SqzAfAfXCQDuR4NPktQ8AYzkEeN9NrsnYSD6"
  );
  const [userName, setUserName] = useState("Unnamed");
  const [userAddress, setUserAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [receiver, setReceiver] = useState("");
  const [transactionPurpose, setTransactionPurpose] = useState("");
  const [newTransactionModalOpen, setNewTransactionModalOpen] = useState(false);
  const [userTransactions, setUserTransactions] = useState([]);

  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  // Setting the user address if the wallet is connected
  useEffect(() => {
    if (connected) {
      setUserAddress(publicKey.toString());
    }
  }, [connected]);

  // Transaction history
  const useGetLocalStorage = (storageKey, fallbackState) => {
    const [value, setValue] = useState(
      JSON.parse(localStorage.getItem(storageKey)) ?? fallbackState
    );

    useEffect(() => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    }, [value, storageKey]);

    return [value, setValue];
  };

  const [transactions, setTransactions] = useGetLocalStorage(
    "transactions",
    []
  );

  // Setting the user address if the wallet is connected
  useEffect(() => {
    if (connected) {
      setUserAddress(publicKey.toString());

      const userDoc = {
        _type: "users",
        _id: publicKey.toString(),
        userName: "Unnamed",
        userMessage: "",
        userVerify: false,
        userAddress: publicKey.toString(),
        userContacts: [],
      };

      console.log(builder.image(avatar));

      client.createIfNotExists(userDoc);

      client.getDocument(publicKey.toString()).then((users) => {
        if (users.userName !== undefined) {
          setUserName(users.userName);
        }

        if (users.userAvatar !== undefined) {
          setAvatar(builder.image(users.userAvatar).url());
        }
      });

      getTransactions();
    }
  }, [connected, publicKey]);

  function getTransactions() {
    const userTransactionsq = transactions.filter(
      (transaction) =>
        transaction.from.name === publicKey.toString() ||
        transaction.from.to === publicKey.toString()
    );

    setUserTransactions(userTransactionsq);
  }

  const makeTransaction = async (fromWallet, toWallet, amount, reference) => {
    console.log(fromWallet);
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);

    // blockhash
    const { blockhash } = await connection.getLatestBlockhash("finalized");

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromWallet,
    });

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: fromWallet,
      lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      toPubkey: toWallet,
    });

    transferInstruction.keys.push({
      pubkey: reference,
      isSigner: false,
      isWritable: false,
    });

    transaction.add(transferInstruction);

    return transaction;
  };

  const doTransaction = async ({ amount, receiver, transactionPurpose }) => {
    const fromWallet = publicKey;
    const toWallet = new PublicKey(receiver);
    const bnAmount = new BigNumber(amount);
    const reference = Keypair.generate().publicKey;
    const transaction = await makeTransaction(
      fromWallet,
      toWallet,
      bnAmount,
      reference
    );

    const confirm = await sendTransaction(transaction, connection);
    console.log(confirm);

    const getNewId = (transactions.length + 1).toString();
    const newTransaction = {
      id: getNewId,
      from: {
        name: publicKey,
        handle: publicKey,
        avatar: avatar,
        verified: true,
      },
      to: {
        name: receiver,
        handle: "-",
        avatar: avatar,
        verified: false,
      },
      description: transactionPurpose,
      transactionDate: new Date(),
      status: "Completed",
      amount: amount,
      source: "-",
      identifier: "-",
    };
    setNewTransactionModalOpen(false);
    setTransactions([newTransaction, ...transactions]);
  };

  return {
    connected,
    publicKey,
    userAddress,
    userName,
    setUserName,
    avatar,
    setAvatar,
    doTransaction,
    amount,
    setAmount,
    receiver,
    setReceiver,
    transactionPurpose,
    setTransactionPurpose,
    transactions,
    setTransactions,
    newTransactionModalOpen,
    setNewTransactionModalOpen,
    userTransactions,
  };
};
