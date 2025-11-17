import React, { useState, useEffect } from "react";
import { User, Package, MapPin, Settings, CreditCard as Edit3, Save, X, Calendar, ArrowLeft, Plus } from 'lucide-react';
import { Link, useLocation } from "react-router-dom";
import UserOrders from "./UserOrders";

// Interface for the new address form
type NewAddressForm = {
  street: string;
  city: string;
  state: string;
  country: string;
  pin: string;
};

type AddNewAddressProps = {
  onSave: (addresses: NewAddressForm[]) => void;
  onCancel: () => void;
};


const AddNewAddress: React.FC<AddNewAddressProps> = ({ onSave, onCancel }) => {
  const [newAddresses, setNewAddresses] = useState<NewAddressForm[]>([
    { street: "", city: "", state: "", country: "", pin: "" } // Start with one blank form
  ]);

  const handleNewAddressChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedAddresses = [...newAddresses];
    updatedAddresses[index] = { ...updatedAddresses[index], [name]: value };
    setNewAddresses(updatedAddresses);
  };

  const addAnotherAddressForm = () => {
    setNewAddresses(prev => [
      ...prev,
      { street: "", city: "", state: "", country: "", pin: "" }
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newAddresses);
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onCancel} // Use the onCancel prop
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Addresses</h1>
          <p className="text-gray-600">
            Add one or more new addresses to your account.
          </p>
        </div>

        {/* Main Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {newAddresses.map((address, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 relative">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Address {index + 1}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={address.street}
                      onChange={(e) => handleNewAddressChange(index, e)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={(e) => handleNewAddressChange(index, e)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={(e) => handleNewAddressChange(index, e)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                      <input
                        type="text"
                        name="pin"
                        value={address.pin}
                        onChange={(e) => handleNewAddressChange(index, e)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={address.country}
                        onChange={(e) => handleNewAddressChange(index, e)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={addAnotherAddressForm}
              className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add More Address
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto mt-4 sm:mt-0 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Save All Addresses
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

type StoredUser = {
  userId: string;
  username: string;
  email: string;
  phoneNumbers: string[];
  addresses: StoredAddress[];
  dateJoined: string;
  createdAt: string;
};

type StoredAddress = {
  address_id: number;
  street: string;
  city: string;
  state: string;
  pin: string;
  country: string;
  user_id?: string;
};

type ComponentAddress = {
  id: number;
  type: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
};

const UserProfile: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    dateJoined: "",
  });

  const [addresses, setAddresses] = useState<ComponentAddress[]>([]);
  useEffect(() => {
    const storedUserString = localStorage.getItem("user");
    if (storedUserString) {
      try {
        const parsedUser: StoredUser = JSON.parse(storedUserString);

        setUserInfo((prevInfo) => ({
          ...prevInfo,
          name: parsedUser.username || "",
          email: parsedUser.email || "",
          phone:
            (parsedUser.phoneNumbers && parsedUser.phoneNumbers.length > 0
              ? parsedUser.phoneNumbers[0]
              : ""),
          dateJoined: parsedUser.createdAt || parsedUser.dateJoined || "", // Get createdAt from your new authRouter
        }));

        if (parsedUser.addresses && parsedUser.addresses.length > 0) {
          const mappedAddresses: ComponentAddress[] = parsedUser.addresses.map(
            (addr, index) => ({
              id: addr.address_id,
              type: "Home",
              name: parsedUser.username || "User",
              address: addr.street,
              city: addr.city,
              zipCode: addr.pin,
              phone:
                (parsedUser.phoneNumbers && parsedUser.phoneNumbers.length > 0
                  ? parsedUser.phoneNumbers[0]
                  : ""),
              isDefault: index === 0,
            })
          );
          setAddresses(mappedAddresses);
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
      }
    } else {
      console.warn("No user found in localStorage.");
    }
    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab);
    }
  }, [location.state]);

  const handleSaveProfile = async () => {
    setIsEditing(false);

    const updatedUserInfo = {
      username: userInfo.name,
      email: userInfo.email,
      phoneNumbers: [userInfo.phone],
    };

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('You are not logged in.');
        return;
      }

      const response = await fetch('http://localhost:3000/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedUserInfo)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile on the server.');
      }

      const savedUser = await response.json();

      // Update localStorage with the server-confirmed data
      localStorage.setItem("user", JSON.stringify(savedUser));

      // Update the state with the new 'dateJoined' (in case it was missing)
      setUserInfo(prev => ({
        ...prev,
        name: savedUser.username,
        email: savedUser.email,
        phone: savedUser.phoneNumbers[0] || "",
        dateJoined: savedUser.createdAt || prev.dateJoined
      }));

      console.log("Profile updated and saved:", savedUser);
    } catch (e) {
      console.error("Failed to save data:", e);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      console.log("User logged out successfully");
      window.location.href = '/';
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleDeleteAccount = async () => {
    // 1. Get user and token from localStorage
    const storedUserString = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");
    let userId;

    if (storedUserString) {
      try {
        const parsedUser: StoredUser = JSON.parse(storedUserString);
        userId = parsedUser.userId;
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        return;
      }
    }
    console.log("HIWEGHDBSAJVDIQHVEF EGYHVFBH", userId, token);
    if (!userId || !token) {
      console.error("No user ID or token found. Cannot delete account.");
      return;
    }

    // 2. Make the real fetch call
    try {
      const response = await fetch(`http://localhost:3000/auth/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      const result = await response.json();
      console.log(result.message); // "user was successfully deleted."

      // 3. Log the user out
      handleLogout();

    } catch (e) {
      console.error("Error deleting account:", e);
    }
  };

  const handleSaveNewAddresses = async (addressesToSave: NewAddressForm[]) => {

    // 1. Get userId from localStorage
    const storedUserString = localStorage.getItem("user");
    let userId;
    if (storedUserString) {
      try {
        const parsedUser: StoredUser = JSON.parse(storedUserString);
        userId = parsedUser.userId;
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }

    if (!userId) {
      console.error("No user ID found. Cannot save addresses.");
      return;
    }

    // 2. Make the real fetch call
    try {
      const response = await fetch('http://localhost:3000/auth/addAddresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addresses: addressesToSave, // Use the argument here
          userId: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save new addresses');
      }

      const result = await response.json();
      console.log(result.message);

      // 3. Optimistic update for UI
      const mappedNewAddresses: ComponentAddress[] = addressesToSave.map((addr, index) => ({
        id: Date.now() + index, // Use a temporary fake ID
        type: "Home",
        name: userInfo.name,
        address: addr.street,
        city: addr.city,
        zipCode: addr.pin,
        phone: userInfo.phone,
        isDefault: addresses.length === 0 && index === 0,
      }));

      // 4. Update local state
      setAddresses(prev => [...prev, ...mappedNewAddresses]);

      // 5. Update localStorage (optimistically)
      if (storedUserString) {
        try {
          const parsedUser: StoredUser = JSON.parse(storedUserString);
          const newStoredAddresses: StoredAddress[] = addressesToSave.map((addr, index) => ({
            ...addr,
            address_id: Date.now() + index, // Fake ID
          }));
          parsedUser.addresses = [...parsedUser.addresses, ...newStoredAddresses];
          localStorage.setItem("user", JSON.stringify(parsedUser));
        } catch (e) {
          console.error("Failed to update localStorage with new addresses", e);
        }
      }

      // 6. Return to profile
      setActiveTab("addresses");
      setIsAddingAddress(false);

    } catch (e) {
      console.error("Error saving new addresses:", e);
    }
  };


  const formatJoinedDate = (dateString: string) => {
    if (!dateString) {
      return "Not set"; // Fallback if date is missing
    }
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-50';
      case 'In Transit': return 'text-blue-600 bg-blue-50';
      case 'Processing': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (isAddingAddress) {
    return (
      <AddNewAddress
        onSave={handleSaveNewAddresses}
        onCancel={() => {
          setIsAddingAddress(false);
          setActiveTab("addresses"); // Ensure we go back to addresses tab
        }}
      />
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">
            Manage your profile, orders, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* User Avatar */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {userInfo.name || "User"}
                </h3>
                <p className="text-gray-600 text-sm">{userInfo.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userInfo.name}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{userInfo.name || "User"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={userInfo.email}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{userInfo.email || "User email"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{userInfo.phone}</p>
                    )}
                  </div>


                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order History
                </h2>
                <UserOrders />

              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Saved Addresses
                  </h2>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add New Address
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">
                            {address.type}
                          </span>
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-gray-600 text-sm space-y-1">
                        <p className="font-medium text-gray-900">
                          {address.name}
                        </p>
                        <p>{address.address}</p>
                        <p>
                          {address.city}, {address.zipCode}
                        </p>
                        <p>{address.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Account Settings
                </h2>
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Notifications
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">
                          Email notifications
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">SMS notifications</span>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">Order updates</span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Privacy
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">
                          Make profile public
                        </span>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-gray-700">
                          Allow marketing emails
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Account Actions
                    </h3>
                    <div className="space-y-3 sm:space-y-0 sm:space-x-3 flex flex-wrap">

                      <button onClick={handleDeleteAccount}
                        className="w-full sm:w-auto px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors ml-0 sm:ml-3">
                        Delete Account
                      </button>
                      <button onClick={handleLogout} className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;