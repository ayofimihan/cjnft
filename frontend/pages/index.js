import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import { Contract, ethers } from "ethers";
import Web3Modal from "web3modal";
import { CONTRACT_ADDRESS, ABI } from "../konstants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
  }, []);


  const startPresale = () =>{

  }

  const checkIfPresaleStarted = async() =>{
    //get the provider
    const provider = await getProviderOrSigner();
    //initialize a new contract from the ethers Contract constructor
    const nftContract = new Contract(CONTRACT_ADDRESS, ABI, provider);



  }

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
      throw new Error("switch chainId to 5 or network to goerli");
    }

    if (needsigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return provider;
  };

  return (
    <div className={styles.main}>
      {walletConnected ? null : <button className={styles.button} onClick={connectWallet}>
        {" "}
        connect wallet
      </button>}
    </div>
  );
}
