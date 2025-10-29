import { User, Mail, Phone, MapPin, Store, CreditCard as Edit, Save, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface UserData {
  name: string;
  email: string;
  storeName: string;
  phone: string;
  address: string;
}

interface ProfileProps {
  onNavigate: (page: string) => void;
}
const getInitialData = (): UserData => {
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      console.log("parsed user is: ", parsedUser);
      const firstAddress = (parsedUser.addresses && parsedUser.addresses.length > 0)
        ? parsedUser.addresses[0]
        : null;
        
      const streetAddress = (firstAddress && typeof firstAddress.street === 'string')
        ? firstAddress.street 
        : '';
      return {
        name: `${parsedUser.username}`,
        email: parsedUser.email || '',
        storeName: parsedUser.storeName || 'My Store', // Add this if it comes from login
        phone: parsedUser.phoneNumbers,
        address: streetAddress,
      };
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
    }
  }

  return {
    name: 'Seller Name',
    email: 'seller@example.com',
    storeName: 'My Store',
    phone: '',
    address: '',
  };
};


export default function Profile({ onNavigate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserData>(getInitialData());
  console.log("runnnign get intinal data: ", getInitialData());
  const handleSave = () => {
    setIsEditing(false);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

      const updatedUser = {
        ...storedUser,
        firstName: formData.name.split(' ')[0], 
        lastName: formData.name.split(' ').slice(1).join(' '),
        email: formData.email,
        storeName: formData.storeName,
        phoneNumbers: [formData.phone],
        addresses: [
          { 
            ...(storedUser.addresses && storedUser.addresses[0]), 
            street: formData.address 
          }
        ],
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log("Profile updated and saved to localStorage:", updatedUser);

    } catch (e) {
      console.error("Failed to save data to localStorage", e);
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={onNavigate} showSearch={false} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Seller Profile</h2>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
                <p className="text-gray-600">{formData.email}</p>
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Store className="w-4 h-4 inline mr-2" />
                Store Name
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Business Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 resize-none"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

    </div>
  );
}
