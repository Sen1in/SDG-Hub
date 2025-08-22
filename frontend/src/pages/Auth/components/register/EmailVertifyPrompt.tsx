import React, { useState } from 'react';

interface EmailVerificationFieldProps {
  email: string;
  code: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  onSendCode: () => Promise<void>;
}

export const EmailVerificationField: React.FC<EmailVerificationFieldProps> = ({
  email,
  code,
  onChange,
  error,
  onSendCode
}) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    if (sending || countdown > 0) return;
    
    setSending(true);
    try {
      await onSendCode();
      setSent(true);
      setCountdown(60);
      

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Send code error:', error);
    } finally {
      setSending(false);
    }
  };

  const getButtonText = () => {
    if (sending) return 'Sending...';
    if (countdown > 0) return `Resend (${countdown}s)`;
    if (sent) return 'Resend Code';
    return 'Send Code';
  };

  const getButtonStyle = () => {
    const baseStyle = "px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200";
    
    if (sending || countdown > 0) {
      return `${baseStyle} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }
    
    return `${baseStyle} bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`;
  };

  return (
    <div>
      <label htmlFor="email_code" className="block text-sm font-medium text-gray-700 mb-2">
        Email Verification Code
      </label>
      <div className="flex space-x-3">
        <div className="flex-1">
          <input
            id="email_code"
            name="email_code"
            type="text"
            value={code}
            onChange={onChange}
            placeholder="Enter verification code"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        </div>
        <button
          type="button"
          onClick={handleSendCode}
          disabled={sending || countdown > 0}
          className={getButtonStyle()}
        >
          {getButtonText()}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {sent && !error && (
        <p className="mt-2 text-sm text-green-600">
          Verification code sent to {email}
        </p>
      )}
    </div>
  );
};