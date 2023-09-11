import React, { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import{ FaTrash, FaWallet } from 'react-icons/fa'

const stripePromise = loadStripe(process.env.stripe_public_key);

const createCheckoutSession = async (cart, email) => {
  const load = toast.loading('Please Wait', {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: 'light',
  });
  const stripe = await stripePromise;

  // Call the backend to create a checkout session
  const checkoutSession = await axios.post('/api/create-checkout-session', {
    items: cart,
    email: email
  });

  await toast.update(load, {
    render: 'Session Created',
    type: 'success',
    isLoading: false,
  });

  //Redirect user to checkout page
  const result = await stripe.redirectToCheckout({
    sessionId: checkoutSession.data.id
  });

  if (result.error)
   alert(`Error: ${result.error.message}`)
   toast.update(load, {
    render: 'Error Occured',
    type: 'error',
    isLoading: false,
  });;
};

const Checkout = ({ cart, clearCart }) => {

  const { data: session } = useSession();
  const [subtotal, setSubtotal] = useState(0)
  const [form, setForm] = useState({ name: "", email: "", address: "", phone: "" })

  useEffect(() => {
    let myTotal = 0
    for (let index = 0; index < cart.length; index++) {
      const element = cart[index];
      myTotal = myTotal + cart[index][1]
    }
    setSubtotal(myTotal)

  }, [])


  const handleEmpty = () => {
    clearCart();
    setSubtotal(0);
    localStorage.removeItem("cart");
    alert('Your Cart is now empty')
  }

  const handleCheckout = async () => {
    await createCheckoutSession(cart, session.user.email);
  };


  return (
    <div className="container px-5 py-24 mx-auto">
      <section className="text-black body-font relative">
        <div className="container px-5 py-24 mx-auto min-h-screen">
          <div className="flex flex-col w-full mb-12">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-black">
              Checkout
            </h1>
            <h2 className="text-2xl font-medium mb-2">Cart</h2>
            <div className="cart mb-4">
              {cart.length ? (
                <ul className="list-decimal px-8">
                  {cart.map((item) => {
                    return (
                      <li key={item.id}>
                        {item[0]} with a price of ${item[1]}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>Your cart is empty!</p>
              )}
            </div>
            <div className="font-bold">Subtotal: ${subtotal}</div>
            <div className="p-2 w-full">
              <button
                onClick={handleEmpty}
                className="flex items-center text-white bg-red-500 border-0 py-2 px-2 focus:outline-none hover:bg-red-600 rounded text-md"
              >
                Empty Cart
                <FaTrash className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
          <div className="">
            <div className="flex flex-wrap -m-2">
              <div className="p-2 w-full">
                <button
                  role="link"
                  onClick={handleCheckout}
                  className="flex items-center text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                >
                  Pay Now
                  <FaWallet className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={4500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover={false}
          theme="light"
        />
      </section>
    </div>
  );
}

export default Checkout