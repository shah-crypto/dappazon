// SPDX-License-Identifier: UNLICENSED


// npx hardhat node
// To start npx hardhat run ./scripts/deploy.js --network localhost
// npm run start
pragma solidity ^0.8.9;

contract Dappazon {
    address public owner;


    //just as in c++
    struct Item{
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order{
        uint256 time;
        Item item;
    }


    // To know how many items are there
    mapping(uint256 => Item) public items;

    // To check orderCount of the individual
    mapping(address => uint256) public orderCount;

    // To check for each individual which order no. has which order
    mapping(address => mapping(uint256 => Order)) public orders;

    //Event is used to get push notification whenever someone touches 
    //the function through email or alerts on website. we can subscribe to
    //the event using ether j   s. Second benifit is the check whenever 
    //this product is listed
    event Buy(address buyer, uint256 orderId, uint256 itemId);
    event List(string name, uint256 cost, uint256 quantity);

    constructor(){
        owner = msg.sender;
    }

    //modifier is used with function to add functionality
    modifier onlyOwner(){
        require(msg.sender==owner);
        //_; this is important cuz modifier means it will add above code
        //to each function where we declare this modifier
        _;
    }

    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner{
        //Create Item struct
        Item memory item = Item(_id, _name, _category, _image, _cost, _rating, _stock);


        //Save Item to blockchain(using mapping)
        items[_id] = item;

        //Emit an event
        emit List(_name, _cost, _stock);
    }


    // Buy products
    // payable is builtin modifier to transfer ethers
    function buy(uint256 _id) public payable{
        Item memory item = items[_id];
        require(msg.value>=item.cost);
        require(item.stock>0);
        Order memory order = Order(block.timestamp, item);
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;
        items[_id].stock = item.stock - 1;
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }


    // To withdraw funds
    function withdraw() public onlyOwner{
        // call is the function to withdraw values from the current SC using this keyword
        // (.balance) means the amount balanced in this SC then it sends true if it is executed
        // successfully and require function checks it
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success);
    }

}
