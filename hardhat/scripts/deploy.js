const {ethers} = require("hardhat");

const {METADATA_URL, WHITELIST_CONTRACT_ADDRESS}=  require("../konstants")
const metadata_url = METADATA_URL;
const whitelist_contract_address = WHITELIST_CONTRACT_ADDRESS;
 
async function main() {
  const Cjcontract = await ethers.getContractFactory('CJ');
  const deployedCj = await Cjcontract.deploy(metadata_url, whitelist_contract_address);
  await deployedCj.deployed();
  console.log(`contract successfully deployed to: ${deployedCj.address}`)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
