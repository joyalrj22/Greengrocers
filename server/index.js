const express = require('express');

const PORT = 3001;
const app = express();

let items = {
    "apple": {
        "name": "Apple",
        "stock": 12,
        "price": 0.6,
        "discount": 0.2
    },
    "orange": {
        "name": "Orange",
        "stock": 2,
        "price": 0.2,
        "discount": 0
    },
    "pear": {
        "name":"Pear",
        "stock": 4,
        "price": 1.80
    }
}

app.get("/items", (_, res) => {
    res.json(items);
});

app.get("/pricecalc", (req, res) => {
    let basket = req.query;
    let totalPrice = 0;
    let totalDiscount = 0;
    Object.keys(basket).forEach((i) => {
        totalDiscount += (items[i].discount*basket[i]);
        totalPrice += (items[i].price*basket[i]);
    });
    res.json({"gross_total":totalPrice, "discount":totalDiscount, "net_total":totalPrice-totalDiscount})
});


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});