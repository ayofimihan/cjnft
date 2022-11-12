import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import {ethers} from 'ethers';

const [walletConnected, setWalletConnected] = useState(false);
const web3ModalRef = useRef();

useEffect(() => {
  if (!walletConnected) {
    web3ModalRef.current = new web3ModalRef({
      network: "goerli",
      providerOptions: {},
      disableInjectedProvider: false,
    });
  }
}, []);

const connectWallet = async () => {
  getProviderOrSigner();
  setWalletConnected(true);
};

const getProviderOrSigner = async (needsigner = false) => {
  const provider = await web3ModalRef.current.connect();
  const web3Provider = new ethers.providers.Web3Provider(provider);
  const { chainId } = await web3Provider.getNetwork();
  if (chainId !== 5) {
    alert("change to goerli make you no go lose money");
  }
  throw new Error("switch chainId to 5 or network to goerli");

  if (needsigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return provider;
};

export default function Home() {
  return <div></div>;
}
