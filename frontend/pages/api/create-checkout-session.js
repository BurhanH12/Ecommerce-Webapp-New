import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const strapiApi = process.env.STRAPI_API_KEY;

export default async (req, res) => {
    const { items, email } = req.body;

    const fetchProductDetails = async (slug) => {
        try {
            let headers = {Authorization: `Bearer ${strapiApi}`}
            let response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products?filters[slug]=${slug}&populate=*`, {headers: headers})
            let product = response.data.data[0];
            return product;
        } catch (error) {
          console.error('Error fetching product details:', error);
          throw error;
        }
      };

      const baseUrl = 'http://localhost:1337';

      const transformedItems = await Promise.all(
        items.map(async (item) => {
          const productDetails = await fetchProductDetails(item[0]);
          console.log("Products here:",productDetails);
          return {
            quantity: 1,
            price_data: {
              currency: 'usd',
              product_data: {
                name: productDetails.attributes.title,
                images: [`${baseUrl}${productDetails.attributes.image.data.attributes.url}`],
                description: productDetails.attributes.description, 
              },
              unit_amount: productDetails.attributes.price * 100,
            },
          };
        })
      );

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: transformedItems,
        mode: 'payment',
        success_url: `http://localhost:3000/success`,
        cancel_url: `http://localhost:3000/checkout`,
        metadata: {
            email,
            images: JSON.stringify(items.map(item => item.image)) 
        }
    })

    res.status(200).json({ id: session.id });
}
