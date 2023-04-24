import { useEffect, useState } from "react";
import { ethers } from "ethers";

import close from "../assets/close.svg";

const Product = ({ item, provider, account, dappazon, togglePop }) => {
  const [order, setOrder] = useState(null);
  const [hasBought, setHasBought] = useState(false);

  const fetchDetails = async () => {
    const events = await dappazon.queryFilter("Buy");
    const orders = events.filter(
      (event) =>
        event.args.buyer === account &&
        event.args.itemId.toString() === item.id.toString()
    );
    if (orders.length === 0) return;
    const order = await dappazon.orders(account, orders[0].args.orderId);
    setOrder(order);
  };

  useEffect(() => {
    fetchDetails();
  }, [hasBought]);

  const buyHandler = async () => {
    const signer = await provider.getSigner();
    let transaction = dappazon
      .connect(signer)
      .buy(item.id, { value: item.cost });
    await transaction.wait();
    setHasBought(true);
  };

  return (
    <div className="product">
      <div className="product__details">
        <div className="product__image">
          <img src={item.image} alt="Product" />
        </div>
        <div className="product__overview">
          <h1>{item.name}</h1>
          <hr />
          <p>{item.address}</p>
          <h4>{ethers.utils.formatUnits(item.cost.toString(), `ether`)} ETH</h4>
          <hr />
          <h3>About the book</h3>
          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum
            eveniet neque consectetur id corrupti culpa aliquam voluptates ab
            similique accusamus totam esse quae quidem enim, vel dignissimos
            maxime repudiandae quos qui nesciunt omnis dolore ex aliquid iusto.
          </p>
          {order && (
            <div className="product_bought_">
              Item bought on <br />
              <strong>
                {new Date(
                  Number(order.time.toString() + "000")
                ).toLocaleDateString(undefined, {
                  weekday: "long",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}
              </strong>
            </div>
          )}
          {item.stock > 0 ? (
            <p className="stock">In Stock.</p>
          ) : (
            <p className="stock">Out of Stock.</p>
          )}
          <div className="btn-parent">
            <button className="product__buy" onClick={buyHandler}>
              Buy Now
            </button>
          </div>
        </div>

        <button onClick={togglePop} className="product__close">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Product;
