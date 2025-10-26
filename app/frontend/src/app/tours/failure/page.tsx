export default function PaymentFailure() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Pago Fallido</h1>
        <p className="text-lg mb-4">Hubo un problema con el pago. Intenta de nuevo.</p>
        <a href="/tours" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Intentar de Nuevo
        </a>
      </div>
    </div>
  );
}

