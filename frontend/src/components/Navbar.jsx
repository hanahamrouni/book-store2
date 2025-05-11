import { Link } from "react-router-dom";
import {
  HiMiniBars3CenterLeft,
  HiOutlineHeart,
  HiOutlineShoppingCart,
} from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlineUser } from "react-icons/hi";

import avatarImg from "../assets/avatar.png";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { useSearchBooksQuery } from "../redux/features/books/booksApi";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/user-dashboard" },
  { name: "Orders", href: "/orders" },
  { name: "Cart Page", href: "/cart" },
  { name: "Check Out", href: "/checkout" },
];

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: books = [], isLoading } = useSearchBooksQuery(searchTerm);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const { currentUser, logout } = useAuth();

  const handleLogOut = () => {
    logout();
  };
  const token = localStorage.getItem("token");
  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6 sticky top-0 bg-white z-[999999]">
      <nav className="flex justify-between items-center">
        {/* left side */}
        <div className="flex items-center md:gap-16 gap-4">
          <Link to="/">
            <HiMiniBars3CenterLeft className="size-6" />
          </Link>
        </div>

        {/* search input */}
        <div className="relative sm:w-72 w-full space-x-2 mx-auto mb-6">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xl" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleChange}
            placeholder="Search By Author or Title or Category"
            className="bg-[#EAEAEA] w-full py-2 pl-10 pr-4 rounded-md focus:outline-none text-sm"
          />

          {/* عرض نتائج البحث */}
          {searchTerm && (
            <div className="absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto bg-white shadow-lg rounded-md z-10">
              {isLoading ? (
                <p className="text-center py-4">Loading ...</p>
              ) : books.length > 0 ? (
                <div className="flex flex-col space-y-4">
                  {books.map((book) => (
                    <div
                      key={book._id}
                      className="bg-white shadow-md p-4 rounded-md flex items-center gap-4"
                    >
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{book.title}</h3>
                        <p className="text-sm text-gray-600">{book.author}</p>
                        <p className="text-sm text-gray-500">{book.category}</p>
                        <p className="text-sm text-yellow-500">
                          ⭐ {book.averageRating?.toFixed(1) || "N/A"}
                        </p>
                        <Link
                          className="bg-primary p-1 sm:px-6 px-2 flex items-center rounded-sm"
                          to={`/books/${book._id}`}
                        >
                          More Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4">Not Found</p>
              )}
            </div>
          )}
        </div>

        {/* باقي العناصر */}
        <div className="relative flex items-center md:space-x-3 space-x-2">
          <div>
            {currentUser ? (
              <>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <img
                    src={avatarImg}
                    alt=""
                    className={`size-7 rounded-full ${
                      currentUser ? "ring-2 ring-blue-500" : ""
                    }`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-40">
                    <ul className="py-2">
                      {navigation.map((item) => (
                        <li
                          key={item.name}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Link
                            to={item.href}
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button
                          onClick={handleLogOut}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : token ? (
              <Link to="/dashboard" className="border-b-2 border-primary">
                Dashboard
              </Link>
            ) : (
              <Link to="/login">
                <HiOutlineUser className="size-6" />
              </Link>
            )}
          </div>

          <Link className="hidden sm:block" to="/favourite">
            <HiOutlineHeart className="size-6" />
          </Link>

          <Link
            to="/cart"
            className="bg-primary p-1 sm:px-6 px-2 flex items-center rounded-sm"
          >
            <HiOutlineShoppingCart className="" />
            {cartItems.length > 0 ? (
              <span className="text-sm font-semibold sm:ml-1">
                {cartItems.length}
              </span>
            ) : (
              <span className="text-sm font-semibold sm:ml-1">0</span>
            )}
          </Link>
        </div>
      </nav>

      <ul className="py-5 max-lg:hidden flex items-center gap-4 justify-center ">
        {navigation.map((item) => (
          <li key={item.name} onClick={() => setIsDropdownOpen(false)}>
            <Link
              to={item.href}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              {item.name}
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogOut}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </li>
      </ul>
    </header>
  );
};

export default Navbar;
