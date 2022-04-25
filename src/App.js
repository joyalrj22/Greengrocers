import styles from './mystyle.module.css'; 
import Button from '@mui/material/Button';
import React from 'react';

function QuantityPicker(props) {
  return (
    <div className={styles.quantity}>
      <Button variant="outlined" onClick={props.reduceQuantityFn} disabled={props.quantity===0}>-</Button>
      <p>{props.quantity}</p>
      <Button variant="outlined" onClick={props.increaseQuantityFn} disabled={props.quantity===props.maxQuantity}>+</Button>
    </div>
  );
}

function PriceLabel(props) {
  let formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  });
  if (props.discount) {
    return (
      <div className={styles.price}>
        <strike>Price: {formatter.format(props.price)}</strike>
        <p>Discounted Price: {formatter.format(props.price - props.discount)}</p>
      </div>
    );
  }
  return <div className={styles.price}>Price: {formatter.format(props.price)}</div>;
}

function TotalsLabel(props) {
  let formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  });
  if (props.runningBasketTotal.discount !== 0) {
    return (
    <div className={styles.price}>
      <p>Total Price before discount: {formatter.format(props.runningBasketTotal.gross_total)}</p>
      <p>Total Discounts applied: {formatter.format(props.runningBasketTotal.discount)}</p>
      <p>Discounted Price: {formatter.format(props.runningBasketTotal.net_total)}</p>
    </div>
    );
  }
  return (
    <div className={styles.price}>
      <p>Total Price: {formatter.format(props.runningBasketTotal.net_total)}</p>
    </div>
  );
}

function ShopItemComponent(props) {
  let reduceQuantityFn = () => {
    props.quantityEditFn(props.itemKey, -1);
  };
  let increaseQuantityFn = () => {
    props.quantityEditFn(props.itemKey, 1);
  };
  return (
    <div className={styles.horizontalcomponent}>
      <p>{props.itemDetails.name}</p>
      <QuantityPicker maxQuantity={props.itemDetails.stock} quantity={props.quantityInBasket} reduceQuantityFn={reduceQuantityFn} increaseQuantityFn={increaseQuantityFn}/>
      <PriceLabel price={props.itemDetails.price} discount={"discount" in props.itemDetails ? props.itemDetails.discount : null}/>
    </div>
  );
}

function ShopItemCollection(props) {
  let quantityEditFn = (itemKey, increment) => {
    props.setBasket({...props.basket, [itemKey]: props.basket[itemKey] + increment});
  }
  return (
    <div>
      {Object.keys(props.items).map(itemKey => {return <ShopItemComponent key={itemKey} itemKey={itemKey} itemDetails={props.items[itemKey]} quantityInBasket={props.basket[itemKey]} quantityEditFn = {quantityEditFn}/>})}
    </div>
  );
}

function App() {
  const [items, setItems] = React.useState(null);
  const [basket, setBasket] = React.useState({})
  const [runningBasketTotal, setRunningBasketTotal] = React.useState({"gross_total":0, "discount":0, "net_total":0}); 
  React.useEffect(() => {
    fetch("/items")
      .then((res) => res.json())
      .then((items) => {
        setItems(items)
        setBasket(Object.keys(items).reduce((initialBasket, itemKey) => {
          initialBasket[itemKey] = 0;
          return initialBasket;
        }, {}))
      })
  }, []);

  React.useEffect(() => {
    if (Object.keys(basket).length !== 0) {
      let params = new URLSearchParams();
      Object.keys(basket).forEach((basketItem) => {params.append(basketItem, basket[basketItem])});
      fetch("/pricecalc?"+params.toString())
        .then((res) => res.json())
        .then((totals) => {
          setRunningBasketTotal(totals);
        });
    }
  }, [basket])
  return (
    <div>
      <div>
        <h1>GREENGROCERS</h1>
      </div>
      {!items ? <p>Loading...</p> : <ShopItemCollection items={items} basket={basket} setBasket={setBasket}/>}
      {Math.max(...Object.values(basket)) === 0 ? <div/> : <TotalsLabel runningBasketTotal={runningBasketTotal} />}
    </div>
  );
}

export default App;
