const User = require('../models/user');
const Subscription = require('../models/subscription');
const mongoose = require('mongoose');
var AWS = require('aws-sdk');
const stripe = require('stripe')(process.env.STRIPE_SECERET);
require('dotenv').config();

AWS.config.update({ accessKeyId: process.env.ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_KEY, region: 'us-east-1' });
const prices = async (req, res) => {
  const prices = await stripe.prices.list();
  res.json(prices.data.reverse());
};

const createSubscription = async (req, res) => {
  // console.log(req.body)
  try {
    const user = await User.findById(req.user._id);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: req.body.priceId,
          quantity: 1,
        },
      ],
      customer: user.stripe_customer_id,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    console.log('checkout session', session);
    res.json(session.url);
  } catch (error) {
    console.log(error);
  }
};

const getSubscriptions = async (req, res) => {
  try {
    let subs = await Subscription.find({
      _id: { $in: req.body.subscriptions },
    });
    res.send({ subscriptions: subs });
  } catch (error) {
    res.send(error.response);
  }
};

const getActiveUsers = async (req, res) => {
  const lambda = new AWS.Lambda();
  const activeUser = await Subscription.aggregate([
    {
      $match: {
        status: 'active',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $group: {
        // get Fields from group
        _id: '$email',
        status: { $first: '$$ROOT.status' },

        dateOfBirth: { $first: '$$ROOT.user.dateOfBirth' },
        pinNumber: { $first: '$$ROOT.user.pinNumber' },
        phoneNumber: { $first: '$$ROOT.user.phoneNumber' },
      },
    },
    {
      $project: {
        _id: 0,
        email: '$_id',
        status: '$status',
        dateOfBirth: '$dateOfBirth',
        pinNumber: '$pinNumber',
        phoneNumber: '$phoneNumber',
      },
    },
  ]);
  try {
    await activeUser.forEach(user => {
      console.log(user)
      const params = {
        FunctionName: 'newestScraper', /* required */
        Payload: JSON.stringify({
          pinNumber: user.pinNumber,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
        })
      };
      console.log(params.Payload)
      lambda.invoke(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); return data;         // successful response
      });

    })
    return res.json("Lambdas launched")
  } catch (err) {
    console.log(err)
  }

  res.send(activeUser);
};

const subscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    const { id, ...rest } = subscriptions.data[subscriptions.data.length - 1];
    const saveSubscriptionMongo = {
      user_id: user._id,
      name: user.name,
      email: user.email,
      stripe_id: id,
      ...rest,
    };

    const createdSubscription = await Subscription.create(
      saveSubscriptionMongo
    );

    const updated = await User.findOneAndUpdate(
      { _id: user._id },
      {
        $push: {
          subscriptions: createdSubscription._id,
        },
      },
      { new: true }
    )
      .populate('subscriptions')
      .exec();

    res.json(updated);
  } catch (error) {
    console.log(error);
  }
};

const subscriptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'all',
      expand: ['data.default_payment_method'],
    });
    res.json({ subscriptions });
  } catch (error) {
    console.log(error);
  }
};

const customerPortal = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: process.env.STRIPE_SUCCESS_URL,
    });
    res.json(portalSession.url);
  } catch (error) {
    console.log(error);
  }
};


module.exports = { createSubscription, prices, getActiveUsers, getSubscriptions, subscriptionStatus, customerPortal, subscriptions }