import { assets, categories } from "../../assets/assets";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
const AddProduct = () => {
  const { axios, backendUrl } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [productId, setProductId] = useState(null);
  useEffect(() => {
    if (location.state && location.state.product) {
      const { product } = location.state;
      setName(product.name);
      setDescription(product.description);
      setCategory(product.category);
      setPrice(product.price);
      setOfferPrice(product.offerPrice);
      setProductId(product._id);
      // Note: Files are not pre-filled for security/browser reasons, but can shown if needed
    }
  }, [location.state]);
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("offerPrice", offerPrice);
      if (productId) {
        formData.append("id", productId);
      }
      for (let i = 0; i < files.length; i++) {
        formData.append("image", files[i]);
      }
      let data;
      if (productId) {
        const response = await axios.post("/api/product/update", formData);
        data = response.data;
      } else {
        const response = await axios.post("/api/product/add-product", formData);
        data = response.data;
      }
      if (data.success) {
        toast.success(data.message);
        if (productId) {
          navigate('/seller/product-list'); 
        } else {
          setName("");
          setDescription("");
          setCategory("");
          setPrice("");
          setOfferPrice("");
          setFiles([]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="py-10 flex flex-col justify-between bg-white">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                    accept="image