import { useState, ChangeEvent, FormEvent } from 'react';
import type { BuildRequest, ValidationErrors } from '../types';

interface ConversionFormProps {
  onSubmit: (request: BuildRequest) => void;
  isBuilding: boolean;
  onReset: () => void;
  hasLogs: boolean;
}

const ConversionForm = ({ onSubmit, isBuilding, onReset, hasLogs }: ConversionFormProps) => {
  const [formData, setFormData] = useState({
    siteUrl: '',
    appName: '',
    packageName: '',
  });
  const [icon, setIcon] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const validatePackageName = (packageName: string): boolean => {
    const regex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
    return regex.test(packageName);
  };

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Icon file size must be less than 5MB');
        return;
      }
      setIcon(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.siteUrl) {
      newErrors.siteUrl = 'Website URL is required';
    } else if (!validateUrl(formData.siteUrl)) {
      newErrors.siteUrl = 'Must be a valid HTTPS URL';
    }

    if (!formData.appName) {
      newErrors.appName = 'App name is required';
    } else if (formData.appName.length < 3) {
      newErrors.appName = 'App name must be at least 3 characters';
    }

    if (!formData.packageName) {
      newErrors.packageName = 'Package name is required';
    } else if (!validatePackageName(formData.packageName)) {
      newErrors.packageName = 'Invalid format. Example: com.example.myapp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const request: BuildRequest = {
      siteUrl: formData.siteUrl,
      appName: formData.appName,
      packageName: formData.packageName,
    };

    if (icon) {
      request.icon = icon;
    }

    onSubmit(request);
  };

  const handleResetForm = () => {
    setFormData({
      siteUrl: '',
      appName: '',
      packageName: '',
    });
    setIcon(null);
    setIconPreview(null);
    setErrors({});
    onReset();
  };

  const isFormValid = formData.siteUrl && 
                      formData.appName && 
                      formData.packageName &&
                      validateUrl(formData.siteUrl) &&
                      validatePackageName(formData.packageName);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white">APK Configuration</h2>
        <p className="text-blue-100 text-sm mt-1">Fill in the details to generate your Android app</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label htmlFor="siteUrl" className="block text-sm font-semibold text-gray-700 mb-2">
            Website URL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <input
              type="text"
              id="siteUrl"
              name="siteUrl"
              value={formData.siteUrl}
              onChange={handleInputChange}
              placeholder="https://example.com"
              disabled={isBuilding}
              className={`block w-full pl-10 pr-3 py-3 border ${
                errors.siteUrl ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors`}
            />
          </div>
          {errors.siteUrl && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.siteUrl}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">Must be a secure HTTPS URL</p>
        </div>

        <div>
          <label htmlFor="appName" className="block text-sm font-semibold text-gray-700 mb-2">
            App Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="text"
              id="appName"
              name="appName"
              value={formData.appName}
              onChange={handleInputChange}
              placeholder="My Awesome App"
              disabled={isBuilding}
              className={`block w-full pl-10 pr-3 py-3 border ${
                errors.appName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors`}
            />
          </div>
          {errors.appName && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.appName}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">This name will appear on the user's device</p>
        </div>

        <div>
          <label htmlFor="packageName" className="block text-sm font-semibold text-gray-700 mb-2">
            Package Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <input
              type="text"
              id="packageName"
              name="packageName"
              value={formData.packageName}
              onChange={handleInputChange}
              placeholder="com.example.myapp"
              disabled={isBuilding}
              className={`block w-full pl-10 pr-3 py-3 border ${
                errors.packageName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-mono text-sm`}
            />
          </div>
          {errors.packageName && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.packageName}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">Reverse domain notation (e.g., com.company.app)</p>
        </div>

        <div>
          <label htmlFor="icon" className="block text-sm font-semibold text-gray-700 mb-2">
            App Icon (Optional)
          </label>
          <div className="flex items-center space-x-4">
            {iconPreview ? (
              <div className="relative">
                <img src={iconPreview} alt="Icon preview" className="w-20 h-20 rounded-lg object-cover border-2 border-gray-300" />
                <button
                  type="button"
                  onClick={() => {
                    setIcon(null);
                    setIconPreview(null);
                  }}
                  disabled={isBuilding}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <label htmlFor="icon" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Choose Icon
              </label>
              <input
                type="file"
                id="icon"
                accept="image/*"
                onChange={handleIconChange}
                disabled={isBuilding}
                className="hidden"
              />
              <p className="mt-2 text-xs text-gray-500">PNG or JPG, max 5MB. Recommended: 512x512px</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 pt-4">
          <button
            type="submit"
            disabled={isBuilding || !isFormValid}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            {isBuilding ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Building APK...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Build APK</span>
              </>
            )}
          </button>

          {hasLogs && !isBuilding && (
            <button
              type="button"
              onClick={handleResetForm}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {!isFormValid && formData.siteUrl && formData.appName && formData.packageName && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-800">
                Please correct the validation errors above before building.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ConversionForm;
