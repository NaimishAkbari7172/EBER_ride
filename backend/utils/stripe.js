const express= require("express");
const stripeApp= express.Router()
const stripe= require("stripe")("sk_test_51PVRDa06N1UTHog99UQBlNEtNeR0kG589zjK9Kf4jqPUIxSUpoN1hQCYPufsHhmLzMakarir4KnJW0dVseN4miib00EzDjBR6z")

stripeApp.post('/checkout', async(req, res)=> {
    console.log(req.body)
    
    try{
        token= req.body.token;
        const customer= stripe.customers.create({
            email: "naimish7172.elluminatiinc@gmail.com",
            source: token.id,
        })
        .then((customer) =>{
            console.log(customer);
            return stripe.chares.create({
                amount: 1000,
                description: " ::: for testing :::",
                currency: "USD",
                customer: customer.id,

            });
        })
        .then((charge)=> {
            console.log(charge);
            res.json({
                data: "success",
            })
        })
        .catch((err)=> {
            res.json({
                data: "failure",
            })
        })
        return true

    }catch(err){
        return false;
        

    }
})

module.exports = stripeApp;