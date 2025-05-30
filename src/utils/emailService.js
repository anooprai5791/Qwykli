import emailjs from '@emailjs/nodejs';

// Configure EmailJS with your credentials
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

// Email addresses to send order notifications
const ADMIN_EMAIL_1 = process.env.ADMIN_EMAIL_1 || 'admin1@example.com';
const ADMIN_EMAIL_2 = process.env.ADMIN_EMAIL_2 || 'admin2@example.com';

// Initialize EmailJS
emailjs.init({
  publicKey: EMAILJS_PUBLIC_KEY,
  privateKey: EMAILJS_PRIVATE_KEY,
});

/**
 * Send order notification emails to both admin addresses
 * @param {Object} order - The populated temp order object
 */
export const sendOrderEmail = async (order) => {
  try {
    // Validate populated fields including Area model structure
    if (!order.user?.email || !order.service?.name || !order.address?.name) {
      throw new Error('Order missing required populated fields (user, service, address)');
    }

    const templateParams = {
      // Order Details (unchanged)
      order_number: order.orderNumber,
      order_id: order._id.toString(),
      order_status: order.status,

      // Customer Information (unchanged)
      customer_name: order.user.name,
      customer_email: order.user.email,
      customer_phone: order.user.phone,

      // Service Information (unchanged)
      service_name: order.service.name,
      service_description: order.service.description,
      service_category: order.service.category,

      // Scheduling Information (unchanged)
      scheduled_date: new Date(order.scheduledDate).toLocaleDateString(),
      scheduled_time: order.scheduledTime,
      scheduled_datetime: order.scheduledDateTime.toLocaleString(),

      // Revised Address Information using Area model
      area_name: order.address.name,
      city: order.address.city,
      full_address: `${order.address.name}, ${order.address.city}`,
      location_coordinates: order.address.location?.coordinates 
        ? `${order.address.location.coordinates[1].toFixed(6)}, ${order.address.location.coordinates[0].toFixed(6)}`
        : 'Not available',

      // Pricing Information (unchanged)
      price: `$${order.service.basePrice.toFixed(2)}`,

      // Additional Information (unchanged)
      order_created: new Date(order.createdAt).toLocaleString(),

      // Admin emails (unchanged)
      admin_email_1: ADMIN_EMAIL_1,
      admin_email_2: ADMIN_EMAIL_2
    };

    // Rest of the email sending logic remains same...
    // (keep the dual email sends and error handling unchanged)
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error(`Email service failed: ${error.message}`);
  }
};

/**
 * Send order confirmation email to customer
 * @param {Object} order - The populated temp order object
 */
// export const sendCustomerOrderConfirmation = async (order) => {
//   try {
//     const templateParams = {
//       to_email: order.user.email,
//       customer_name: order.user.name,
//       order_number: order.orderNumber,
//       service_name: order.service.name,
//       scheduled_date: new Date(order.scheduledDate).toLocaleDateString(),
//       scheduled_time: order.scheduledTime,
//       full_address: order.fullAddress,
//       price: `$${order.price.toFixed(2)}`,
//       customer_notes: order.customerNotes || 'No additional notes',
//       order_status: order.status,
//       urgency: order.urgency
//     };

//     const result = await emailjs.send(
//       EMAILJS_SERVICE_ID,
//       'customer_order_confirmation', // You'll need a separate template for customer confirmations
//       templateParams
//     );

//     console.log('Customer order confirmation email sent:', result.status);
//     return { success: true, result };

//   } catch (error) {
//     console.error('Error sending customer order confirmation email:', error);
//     throw new Error(`Failed to send customer order confirmation email: ${error.message}`);
//   }
// };

// /**
//  * Send order status update email
//  * @param {Object} order - The populated temp order object
//  * @param {string} oldStatus - Previous status
//  * @param {string} newStatus - New status
//  */
// export const sendOrderStatusUpdateEmail = async (order, oldStatus, newStatus) => {
//   try {
//     const templateParams = {
//       to_email: order.user.email,
//       customer_name: order.user.name,
//       order_number: order.orderNumber,
//       service_name: order.service.name,
//       old_status: oldStatus,
//       new_status: newStatus,
//       scheduled_datetime: order.scheduledDateTime.toLocaleString(),
//       order_url: `${process.env.FRONTEND_URL}/orders/${order._id}` // Assuming you have a frontend URL
//     };

//     const result = await emailjs.send(
//       EMAILJS_SERVICE_ID,
//       'order_status_update', // You'll need a template for status updates
//       templateParams
//     );

//     console.log('Order status update email sent:', result.status);
//     return { success: true, result };

//   } catch (error) {
//     console.error('Error sending order status update email:', error);
//     throw new Error(`Failed to send order status update email: ${error.message}`);
//   }
// };