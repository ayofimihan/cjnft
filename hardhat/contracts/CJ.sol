//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CJ is ERC721Enumerable, Ownable {

    string _baseTokenURI;
    IWhitelist whitelist;
    bool public presaleStarted;
    uint public presaleEnded;
    uint public maxTokenIds = 20;
    uint public tokenIds;
    uint public price = 0.01 ether;
    bool public paused;




    constructor (string memory baseURI, address whitelistContract) ERC721('California jacuzzi', "CJ"){

        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);

    }

    function startPresale() public onlyOwner{
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;

    }

    function presaleMint() public payable onlyOwner onlyWhenPaused{
        require(presaleStarted && block.timestamp < presaleEnded, "presale ended, mint with the regulars");
        require(whitelist.whitelistedAddresses(msg.sender), "You are not whitelisted");
        require(tokenIds < maxTokenIds, "limit reached");
        require(msg.value >= price, "broke??");

        tokenIds+=1; 
        _safeMint(msg.sender, tokenIds);


    }

    function mint() public payable onlyWhenPaused{
        require(presaleStarted && block.timestamp >= presaleEnded, "whitelist mint still on");
        require(tokenIds < maxTokenIds, "limit reached");
        require(msg.value >= price, "broke??");

        tokenIds +=1;
        _safeMint(msg.sender, tokenIds);

    }

    function _baseURI() internal view override returns(string memory){
        return _baseTokenURI;
    }

    function withdraw() public payable{
        address _owner = owner();
        uint amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "txn failed");
    }

   

    modifier onlyWhenPaused() {
        require(paused, "contract not paused");
        _;

    }


    function setPaused(bool val) public {
        paused = val; 
    }

  
   




    receive() external payable{}
    fallback() external payable{}



} 


