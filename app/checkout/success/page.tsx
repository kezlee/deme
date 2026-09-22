export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="bg-white border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-lg text-gray-600">
          Thank you for your purchase. Your payment has been processed successfully.
        </p>
      </div>
      
    </div>
  );
}