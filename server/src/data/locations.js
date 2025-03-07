/**
 * Game locations with associated roles
 * Each location has a name and an array of possible roles
 */
const locations = [
  {
    name: 'Hospital',
    roles: [
      'Doctor',
      'Nurse',
      'Surgeon',
      'Patient',
      'Therapist',
      'Intern',
      'Visitor',
      'Receptionist',
      'Anesthesiologist',
      'Janitor'
    ]
  },
  {
    name: 'School',
    roles: [
      'Teacher',
      'Principal',
      'Student',
      'Janitor',
      'Cafeteria Worker',
      'Security Guard',
      'Librarian',
      'School Nurse',
      'Parent',
      'Coach'
    ]
  },
  {
    name: 'Beach',
    roles: [
      'Lifeguard',
      'Tourist',
      'Surfer',
      'Ice Cream Vendor',
      'Fisherman',
      'Photographer',
      'Swimmer',
      'Beach Volleyball Player',
      'Sunbather',
      'Coast Guard'
    ]
  },
  {
    name: 'Movie Theater',
    roles: [
      'Ticket Seller',
      'Moviegoer',
      'Usher',
      'Concession Stand Worker',
      'Manager',
      'Projectionist',
      'Actor/Actress',
      'Critic',
      'Cleaner',
      'Security Guard'
    ]
  },
  {
    name: 'Restaurant',
    roles: [
      'Chef',
      'Waiter/Waitress',
      'Host/Hostess',
      'Customer',
      'Food Critic',
      'Dishwasher',
      'Manager',
      'Bartender',
      'Busboy',
      'Delivery Driver'
    ]
  },
  {
    name: 'Gym',
    roles: [
      'Personal Trainer',
      'Gym Member',
      'Receptionist',
      'Yoga Instructor',
      'Weightlifter',
      'Janitor',
      'Manager',
      'Nutritionist',
      'Newcomer',
      'Maintenance Worker'
    ]
  },
  {
    name: 'Supermarket',
    roles: [
      'Cashier',
      'Customer',
      'Manager',
      'Shelf Stocker',
      'Butcher',
      'Baker',
      'Produce Manager',
      'Janitor',
      'Cart Collector',
      'Deli Worker'
    ]
  },
  {
    name: 'Airplane',
    roles: [
      'Pilot',
      'Co-Pilot',
      'Flight Attendant',
      'First Class Passenger',
      'Economy Passenger',
      'Air Marshal',
      'Child Passenger',
      'Elderly Passenger',
      'Business Traveler',
      'Tourist'
    ]
  },
  {
    name: 'Bank',
    roles: [
      'Teller',
      'Manager',
      'Security Guard',
      'Customer',
      'Loan Officer',
      'Janitor',
      'Investment Advisor',
      'Armored Car Driver',
      'Bank Robber',
      'New Account Specialist'
    ]
  },
  {
    name: 'Cruise Ship',
    roles: [
      'Captain',
      'Passenger',
      'Waiter/Waitress',
      'Musician',
      'Bartender',
      'Deck Hand',
      'Security Officer',
      'Chef',
      'Entertainer',
      'Housekeeper'
    ]
  },
  {
    name: 'Amusement Park',
    roles: [
      'Ride Operator',
      'Visitor',
      'Food Vendor',
      'Ticket Seller',
      'Mascot',
      'Janitor',
      'Security Guard',
      'Tour Guide',
      'Photographer',
      'Maintenance Worker'
    ]
  },
  {
    name: 'Zoo',
    roles: [
      'Zookeeper',
      'Visitor',
      'Veterinarian',
      'Tour Guide',
      'Gift Shop Clerk',
      'Security Guard',
      'Ticket Seller',
      'Researcher',
      'Photographer',
      'Janitor'
    ]
  }
];

module.exports = locations; 