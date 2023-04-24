const { expect } = require("chai")
const { ethers } = require("hardhat")


//1 ether is equal to 10^18 wei. So below function converts it
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
} 

// Global items...
const ID = 1
const NAME = "Shoes"
const CATEGORY = "Clothing"
//IPFS is used to pre store contents and use them via https links
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
const COST = tokens(1)
const RATING = 4
const STOCK = 5


describe("Dappazon", () => {
  let dappazon, deployer, buyer;
  beforeEach(async()=>{
    //getSigners function sends us 20 dummy accounts and it sends us 
    //is array format. So we are using only 2 of those and making one as owner
    //and other as buyer
    [deployer, buyer] = await ethers.getSigners();
    
    //Below variable is used to fetch the smart contract
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  })
  
  //it is just the testing functionality because blockchain handles real money
  //so we need to check if its bug free therefore we are doing a automation 
  //testing using hardhat
  describe("Deployment", ()=>{
    it("Sets the owner", async()=>{
      expect(await dappazon.owner()).to.equal(deployer.address);
    })
  })
  
  describe("Listing", ()=>{
    let transaction;
    beforeEach(async ()=>{
        // List an item
        transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
        await transaction.wait();
        // let ans = await ethers.getSigners();
        // let check = ans[0].address;
        // console.log(ans[0])
      })
      
      it("Returns item attributes", async()=>{
        const item = await dappazon.items(ID);
        // console.log(item);
        expect(item.id).to.equal(ID);
        expect(item.name).to.equal(NAME);
        expect(item.category).to.equal(CATEGORY);
        expect(item.image).to.equal(IMAGE);
        expect(item.cost).to.equal(COST);
        expect(item.rating).to.equal(RATING);
        expect(item.stock).to.equal(STOCK);
      })


      
      it("Emits List event", async()=>{
        expect(transaction).to.emit(dappazon, "List");
      })
    })


    describe("Buying", ()=>{
      let transaction;
      beforeEach(async ()=>{
        // List an item
        transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
        await transaction.wait();

        // Buy an item
        // Metadata value: COST is used because we used payable in our 
        // buy function.
        // COST is the COST of the product
        transaction = await dappazon.connect(buyer).buy(ID, {value: COST});
        await transaction.wait();
        // let c = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        // console.log(c.getBalance());

      })
      
      it("Updates buyer's order count", async()=>{
        const result = await dappazon.orderCount(buyer.address);
        expect(result).to.equal(1);
      })

      it("Adds the order", async()=>{
        const order = await dappazon.orders(buyer.address, 1);
        expect(order.time).to.be.greaterThan(0);
        expect(order.item.name).to.equal(NAME);
      })

       //Update the balance
      it("Updates the contract balance", async()=>{
        const result = await ethers.provider.getBalance(dappazon.address);
        // console.log(result);
        expect(result).to.equal(COST);
      })

      it("Emits Buy event", ()=>{
        expect(transaction).to.emit(dappazon, "Buy");
      })

    })



    describe("Withdrawing", ()=>{
      let balanceBefore;
      beforeEach(async ()=>{
        // List an item
        let transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
        await transaction.wait();

        // Buy an item
        transaction = await dappazon.connect(buyer).buy(ID, {value: COST});
        await transaction.wait();
        
        // Get deployer balance before
        balanceBefore = await ethers.provider.getBalance(deployer.address);

        // Withdraw 
        transaction = await dappazon.connect(deployer).withdraw();
        await transaction.wait();
      })

      it("Updates owner's balance", async()=>{
        const balanceAfter = await ethers.provider.getBalance(deployer.address);
        expect(balanceAfter).to.greaterThan(balanceBefore);
      })

      it("Updates the SC's balance", async()=>{
        const result = await ethers.provider.getBalance(dappazon.address);
        expect(result).to.equal(0);
      })

      

    })

    
    
})
