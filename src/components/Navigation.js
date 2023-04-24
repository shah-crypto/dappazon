import { ethers } from "ethers";

const Navigation = ({ account, setAccount }) => {
  const connectHandler = async () => {
    const accounts = await window.ethereum.request({
      method: `eth_requestAccounts`,
    });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);
  };

  return (
    <>
      <div className="nav__brand">
        <h1>Library Management System</h1>
      </div>
    </>
  );
};

export default Navigation;
