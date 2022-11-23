import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import { Contract, ethers, utils } from "ethers";
import Web3Modal from "web3modal";
import { CONTRACT_ADDRESS, ABI } from "../konstants";
import Head from "next/head";
import { Audio } from "react-loader-spinner";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setpresaleEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setisOwner] = useState(false);
  const [numTokensMinted, setNumTokensMinted] = useState("");
  const web3ModalRef = useRef();

  const loader = () => (
    <div>
      <Audio width="100" height="100" color="blue" />
    </div>
  );

  const onPageLoad = async () => {
    await connectWallet();
    await getowner();
    await getNumOfTokensMinted();
    const presaleStarted = await checkIfPresaleStarted();
    if (presaleStarted) {
      await checkIfPresaleEnded();
    }

    setInterval(async () => {
      await getNumOfTokensMinted();
    }, 4 * 1000);

    setInterval(async () => {
      const presaleStarted = await checkIfPresaleStarted();
      if (presaleStarted) {
        await checkIfPresaleEnded();
      }
    }, 4 * 1000);
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

  const getNumOfTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(CONTRACT_ADDRESS, ABI, provider);
      const numTokenIds = await nftContract.tokenIds();
      setNumTokensMinted(numTokenIds.toString());
      console.log(numTokensMinted);
    } catch (error) {
      console.log(error);
    }
  };

  const publicMint = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const presaleMint = async () => {
    setLoading(true);
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
    setLoading(false);
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
      return _hasPresaleEnded;
    } catch (error) {
      console.error(error);
      return false;
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
    setLoading(true);
    try {
      //get the signer from the getproviderorsigner function
      const signer = await getProviderOrSigner(true);
      //instance of the contract
      const nftContract = new Contract(CONTRACT_ADDRESS, ABI, signer);
      const txn = await nftContract.startPresale();
      await txn.wait();
      setPresaleStarted(true);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
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
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
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
    return web3Provider;
  };

  function renderBody() {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    // if (loading) {
    //   loader();
    // }
    // If connected user is the owner, and presale hasnt started yet, allow them to start the presale
    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale.
        </button>
      );
    }

    // If connected user is not the owner but presale hasn't started yet, tell them that
    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>
            Presale hasnt started, come back later.
          </div>
        </div>
      );
    }

    // If presale started, but hasn't ended yet, allow for minting during the presale period
    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>Whitelist mint is live! </div>
          
          {loading ? loader() : <button className={styles.button} onClick={presaleMint}>
            Whitelist Mint 🚀
          </button>}
        </div>
      );
    }

    // If presale started and has ended, its time for public minting
    if (presaleStarted && presaleEnded) {
      return (
        <>
          <h4 className={styles.description}> Public mint is live, hurry!</h4>
          <button className={styles.button} onClick={publicMint}>
            Public Mint 🚀
          </button>
        </>
      );
    }
  }
  return (
    <div>
      <Head>
        <title> Cj nft</title>
      </Head>
      <div className={styles.main}>
        {" "}
        <div>
          <h2 className={styles.title}> Welcome to California Jacuzzi</h2>
          <div className={styles.description}>
            {" "}
            California jacuzzi NFT is a collection for fuckers in Cj{" "}
          </div>
          <div className={styles.description}>
            {" "}
            {numTokensMinted}/20 minted!
          </div>
          {renderBody()}
        </div>
        <img className={styles.image} src="/devv.svg" />
      </div>
      <footer className={styles.footer}> 0x65ch</footer>
    </div>
  );
}

// return <div className={styles.main}>{renderBody()}</div>;
