import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const strapiApi = process.env.STRAPI_API_KEY;

const AddProduct = () => {
  const { data: session, status } = useSession();

  const initialFormData = {
    title: "",
    description: "",
    category: "",
    size: "",
    price: "",
    image: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Get the selected image file
    setFormData((prevFormData) => ({
      ...prevFormData,
      image: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const load = toast.loading("Please wait...");

    // Convert the title to lowercase and remove spaces to generate the slug
    formData.slug = formData.title.toLowerCase().replace(/\s+/g, "");

    try {
      const response = await fetch("http://localhost:1337/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
          `Bearer ${strapiApi}`,
        },
        body: JSON.stringify({ data: formData }),
      });

      if (response.ok) {
        const productData = await response.json(); // Parse the response to get the product data
        const productId = productData.data.id; // Get the product ID from the response
        console.log("Product Id", productId);

        // Step 2: Upload the image if it exists
        if (formData.image) {
          const imageFormData = new FormData();
          imageFormData.append("files", formData.image, formData.image.name);
          imageFormData.append("ref", "api::product.product");
          imageFormData.append("refId", productId); // Use the product Id as the refId
          imageFormData.append("field", "image"); // Assuming the field name for the image in the "product" model is "image"

          console.log(imageFormData);

          const imageUploadResponse = await fetch(
            "http://localhost:1337/api/upload",
            {
              method: "POST",
              headers: {
                Authorization:
                `Bearer ${strapiApi}`,
              },
              body: imageFormData,
            }
          );

          if (!imageUploadResponse.ok) {
            console.error("Failed to upload image");
            return;
          }
        }

        await toast.update(load, {
          render: "Product Added Successfully",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          position: "top-right",
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setFormData(initialFormData); // Clear the form after successful submission
      } else {
        throw new Error("Failed to add product.");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please try again later.");
    } finally {
      setFormData(initialFormData); // Clear the form after submission, regardless of success or error
    }
  };

  if (status === "authenticated") {
    return (
      <div className="container mx-auto px-4">
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">Add Product</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label htmlFor="image">Image:</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="category">Category:</label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500 appearance-none"
                  required
                >
                  <option value="" disabled defaultValue>
                    Please Select a Category
                  </option>
                  <option value="tshirt">T-Shirt</option>
                  <option value="mug">Mug</option>
                  <option value="hoodie">Hoodie</option>
                  <option value="stickers">Stickers</option>
                  <option value="electronics">Electronics</option>
                </select>
                <div className="absolute right-0 top-0 h-full w-10 text-center pointer-events-none flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 transform text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="size">Size:</label>
              <input
                type="text"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="price">Price:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Product
            </button>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover={false}
              theme="light"
            />
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="text-gray-500 mb-6">Please sign in to Add Products.</p>
        <Link href="/api/auth/signin">
          <p className="bg-blue-500 text-white px-4 py-2 rounded-md">Sign In</p>
        </Link>
      </div>
    </div>
  );
};

export default AddProduct;
