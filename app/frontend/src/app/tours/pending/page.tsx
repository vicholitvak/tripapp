export default function PaymentPending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-yellow-600 mb-4">Pago Pendiente</h1>
        <p className="text-lg mb-4">Tu pago está en proceso. Te notificaremos pronto.</p>
        <a href="/tours" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Volver a Tours
        </a>
      </div>
    </div>
  );
}

