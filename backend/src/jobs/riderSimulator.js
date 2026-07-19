import { pool } from '../config/database.js';

export const startSimulation = (io) => {
  setInterval(async () => {
    try {
      const result = await pool.query(`
        SELECT o.id, o.simulation_step, 
               d.lat as store_lat, d.lng as store_lng,
               a.lat as delivery_lat, a.lng as delivery_lng
        FROM orders o
        JOIN dark_stores d ON o.dark_store_id = d.id
        JOIN addresses a ON o.address_id = a.id
        WHERE o.status = 'out_for_delivery'
      `);

      for (const order of result.rows) {
        let step = order.simulation_step + 5; 
        if (step > 100) step = 100;

        const fraction = step / 100;
        const currentLat = order.store_lat + (order.delivery_lat - order.store_lat) * fraction;
        const currentLng = order.store_lng + (order.delivery_lng - order.store_lng) * fraction;
        const eta = Math.round((100 - step) * 2); 

        if (step === 100) {
          await pool.query(
            "UPDATE orders SET status = 'delivered', rider_lat = $1, rider_lng = $2, eta_seconds = 0, simulation_step = 100 WHERE id = $3",
            [currentLat, currentLng, order.id]
          );
        } else {
          await pool.query(
            "UPDATE orders SET rider_lat = $1, rider_lng = $2, eta_seconds = $3, simulation_step = $4 WHERE id = $5",
            [currentLat, currentLng, eta, step, order.id]
          );
        }

        io.to(`order:${order.id}`).emit('tracking_update', {
          order_id: order.id,
          status: step === 100 ? 'delivered' : 'out_for_delivery',
          rider_lat: currentLat,
          rider_lng: currentLng,
          eta_seconds: step === 100 ? 0 : eta,
          simulation_step: step
        });
      }
    } catch (error) {
      console.error('Simulation error:', error);
    }
  }, 3000);
};
