export type BookingEmailDetails = {
    userEmail: string;
    userName: string;
    eventTitle: string;
    seats: number;
    totalPrice: number;
    bookingId: string;
};

export const sendBookingConfirmationEmail = (
    details: BookingEmailDetails
): void => {
    setImmediate(() => {
        console.log('BACKGROUND EMAIL SIMULATION');
        console.log(`To          : ${details.userName} <${details.userEmail}>`);
        console.log(`Subject     : Booking Confirmation: "${details.eventTitle}"`);
        console.log(`Hi ${details.userName},`);
        console.log(`Your booking has been successfully confirmed!`);
        console.log(`- Booking ID  : ${details.bookingId}`);
        console.log(`- Event       : ${details.eventTitle}`);
        console.log(`- Seats Booked: ${details.seats}`);
        console.log(`- Total Paid  : $${details.totalPrice}`);
        console.log('Thank you for using our Booking System');
    });
};
