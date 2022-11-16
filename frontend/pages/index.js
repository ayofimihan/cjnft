import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import { Contract, ethers, Signer, utils } from "ethers";
import Web3Modal, { getProviderDescription } from "web3modal";
import { CONTRACT_ADDRESS, ABI } from "../konstants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setpresaleEnded] = useState(false);
  const [isOwner, setisOwner] = useState(false);
  const web3ModalRef = useRef();

  const onPageLoad = async () => {
    await connectWallet();
    await getowner();
    const presaleStarted = await checkIfPresaleStarted();
    if (presaleStarted) {
      await checkIfPresaleEnded();
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      onPageLoad();
    }
  }, []);

  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
      const txn = await nftContract.publicMint({
        value: utils.parseEther("0.01"),
      });
      await txn.wait();
      alert("successfully minted!");
    } catch (error) {
      console.error(error);
    }
  };

  const presaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      await txn.wait();
      alert("minted successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfPresaleEnded = async () => {
    try {
      //get signer
      const provider = await getProviderOrSigner();
      //initialize new nftcontract
      const nftContract = new Contract(CONTRACT_ADDRESS, ABI, provider);
      //
      const presaleEndTime = await nftContract.presaleEnded(); //this will return a big number cos presaleended is a uint256
      const currentTimeInSeconds = Date.now() / 1000;
      //use the lt method to compare big numbers and floor the current time in seconds to avoid float
      const _hasPresaleEnded = presaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      );
      //set presaleended to the boolean value of _haspresaleended
      setpresaleEnded(_hasPresaleEnded);
    } catch (error) {
      console.error(error);
    }
  };

  //this helper function is to make sure its only the owner(onlyowner) that sees a button to call the startpresale function.

  const getowner = async () => {
    try {
      //get signer and initialize a new nftcontract then create 2 variables that returns the connected address and address of the owner of the contract
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
      const owner = await nftContract.owner();
      const connectedAddy = await signer.getAddress();
      console.log(`owner: ${owner}, connectedAddress: ${connectedAddy}`);
      if (owner.toLowerCase() === connectedAddy.toLowerCase()) {
        setisOwner(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const startPresale = async () => {
    try {
      //get the signer from the getproviderorsigner function
      const signer = await getProviderOrSigner(true);
      //instance of the contract
      const nftContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
      const txn = await nftContract.startPresale();
      await txn();
      setPresaleStarted(true);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      //get your provider or signer
      const provider = await getProviderOrSigner();
      //create an instance of the nft contract with the contract constructor from ethers
      //requires the contract addy, abi and provider or signer
      const nftContract = new Contract(CONTRACT_ADDRESS, ABI, provider);
      //use the contract instance created to call functions on the contract
      const _isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(_isPresaleStarted);
      return _isPresaleStarted;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
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

  const renderBody = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      );
    }
    if (isOwner && !presaleStarted) {
      return (
        <button
          className={`${styles.button} ${styles.btnglow}`}
          onClick={startPresale}
        >
          {" "}
          Start Presale
        </button>
      );
      //render a button to start the presale
    }
    if (!isOwner && !presaleStarted) {
      return (
        <div>
          {" "}
          <h4 className={styles.description}>
            {" "}
            Presale mint hasn't started, come back soon.
          </h4>
        </div>
      );
      //render div to say presale hasnt sstarted yet
    }
    if (presaleStarted && !presaleEnded) {
      return (
        <button className={`${styles.button} ${styles.btnglow}`} onClick={""}>
          {" "}
        </button>
      );
      //render a mint button
      //check if they are in whitelist
    }
    if (presaleEnded) {
      //ngmi text try public
    }
  };

  return <div className={styles.main}>{renderBody()}</div>;
}
