'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tour {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  capacity: number;
}

interface Booking {
  _id: string;
  tour: Tour;
  status: string;
  numberOfPeople: number;
  totalPrice: number;
}

export default function Operators() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTour, setNewTour] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'adventure',
    location: '',
    capacity: 10,
    operator: '64f1b2c3d4e5f6789abc0001' // Mock operator ID
  });

  useEffect(() => {
    fetchTours();
    fetchBookings();
  }, []);

  const fetchTours = () => {
    fetch('http://localhost:5000/api/tours')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTours(data);
        } else {
          console.error('Expected array of tours, got:', data);
          setTours([]);
        }
      })
      .catch(err => {
        console.error('Error fetching tours:', err);
        setTours([]);
      });
  };

  const fetchBookings = () => {
    fetch('http://localhost:5000/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          console.error('Expected array of bookings, got:', data);
          setBookings([]);
        }
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setBookings([]);
      });
  };

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTour)
      });
      if (res.ok) {
        fetchTours();
        setShowCreateForm(false);
        setNewTour({ title: '', description: '', price: 0, category: 'adventure', location: '', capacity: 10, operator: '64f1b2c3d4e5f6789abc0001' });
        alert('Tour creado exitosamente!');
      } else {
        const errorData = await res.json();
        alert(`Error al crear tour: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error creating tour:', err);
      alert('Error al crear tour. Verifica que la base de datos esté conectada.');
    }
  };

  const handleTransfer = async (bookingId: string, newOperatorId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/transfer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferredTo: newOperatorId })
      });
      if (res.ok) {
        fetchBookings();
        alert('Reserva transferida exitosamente!');
      } else {
        const errorData = await res.json();
        alert(`Error al transferir reserva: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error transferring booking:', err);
      alert('Error al transferir reserva. Verifica que la base de datos esté conectada.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Operadores</h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">← Volver al inicio</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            {showCreateForm ? 'Cancelar' : 'Crear Nuevo Tour'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateTour} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Título"
                value={newTour.title}
                onChange={(e) => setNewTour({...newTour, title: e.target.value})}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Descripción"
                value={newTour.description}
                onChange={(e) => setNewTour({...newTour, description: e.target.value})}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={newTour.price}
                onChange={(e) => setNewTour({...newTour, price: +e.target.value})}
                className="border p-2 rounded"
                required
              />
              <select
                value={newTour.category}
                onChange={(e) => setNewTour({...newTour, category: e.target.value})}
                className="border p-2 rounded"
              >
                <option value="adventure">Aventura</option>
                <option value="cultural">Cultural</option>
                <option value="food">Comida</option>
                <option value="transport">Transporte</option>
              </select>
              <input
                type="text"
                placeholder="Ubicación"
                value={newTour.location}
                onChange={(e) => setNewTour({...newTour, location: e.target.value})}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Capacidad"
                value={newTour.capacity}
                onChange={(e) => setNewTour({...newTour, capacity: +e.target.value})}
                className="border p-2 rounded"
                required
              />
            </div>
            <button type="submit" className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
              Crear Tour
            </button>
          </form>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Mis Tours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <div key={tour._id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{tour.title}</h3>
                <p className="text-gray-600 mb-2">{tour.description}</p>
                <p className="text-sm text-gray-500">Precio: ${tour.price}</p>
                <p className="text-sm text-gray-500">Capacidad: {tour.capacity}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Reservas</h2>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{booking.tour.title}</h3>
                  <p className="text-gray-600">Personas: {booking.numberOfPeople} | Total: ${booking.totalPrice}</p>
                  <p className="text-sm text-gray-500">Estado: {booking.status}</p>
                </div>
                {booking.status !== 'transferred' && (
                  <button
                    onClick={() => handleTransfer(booking._id, '64f1b2c3d4e5f6789abc0002')} // Mock new operator ID
                    className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700"
                  >
                    Transferir
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
