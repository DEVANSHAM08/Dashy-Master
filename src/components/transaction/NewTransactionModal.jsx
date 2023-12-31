import { useState } from 'react';
import {ModalClose} from '../Modal';
import { useDashy } from '../../hooks/dashy';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewTransactionModal = ({ modalOpen, setModalOpen }) => {
    const {doTransaction, amount, setAmount, receiver, setReceiver, transactionPurpose, setTransactionPurpose} = useDashy();
    const success = () => toast.success('Transaction completed', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
    const onAmountInput = (e) => {
        e.preventDefault();
        const newAmount = e.target.value;

        setAmount(newAmount);

        const input = document.querySelector('input#amount');
        input.style.width = newAmount.length + 'ch';
    }

    const onPay = async () => {
        // Pay and add transaction funcationallity goes here!
        
        await doTransaction({
            amount,
            receiver,
            transactionPurpose
        });
        // Clear states
        setModalOpen(false);
        success();
        setAmount(0);
        setReceiver("");
        setTransactionPurpose("");
    }

    return (
        <ModalClose modalOpen={modalOpen} setModalOpen={setModalOpen}>
            <div className="relative flex flex-col items-center justify-center space-y-8">
                <div className="flex items-center justify-center text-center text-7xl font-semibold text-[#7A49CA]">
                    <input className="w-20 outline-none overflow-hidden overflow-y-hidden" id="amount" name="amount" type="number" value={amount} onChange={onAmountInput} min={0} />
                    <label htmlFor="amount">SOL</label>
                </div>

                <div className="flex w-full flex-col space-y-2">
                    <div className="flex rounded-lg border border-gray-200 p-4">
                        <label className="text-gray-300" htmlFor="receiver">
                            To:
                        </label>
                        <input className="w-full pl-2 font-medium text-gray-600 placeholder-gray-300 outline-none" id="receiver" name="receiver" type="text" placeholder="Address" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
                    </div>

                    <div className="flex rounded-lg border border-gray-200 p-4">
                        <label className="text-gray-300" htmlFor="transactionPurpose">
                            For:
                        </label>
                        <input className="w-full pl-2 font-medium text-gray-600 placeholder-gray-300 outline-none" id="transactionPurpose" name="transactionPurpose" type="text" placeholder="Dinner, Rent, etc." value={transactionPurpose} onChange={(e) => setTransactionPurpose(e.target.value)} />
                    </div>
                </div>

                <div className="flex w-full space-x-1">
                    <button onClick={onPay} className="w-full rounded-lg bg-[#7A49CA] py-3 px-12 text-white hover:bg-opacity-70">
                        Pay
                    </button>
                </div>
            </div>
        </ModalClose>
    );
}

export default NewTransactionModal;