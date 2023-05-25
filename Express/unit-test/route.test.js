const request = require('supertest');
const app = require('../index');
const { Bus, Seats, Ticket } = require('../model/bus-model');
const { describe, it } = require('node:test');

describe("DELETE /delete-bus/:id", () => {

  test("should return error message if bus not found", async () => {
    const response = await request(app).delete("/delete-bus/invalidId");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Give Valid Data or Check inputs");
  });
});

describe('POST /add-bus', () => {
  it('should return 200 status and success message', async () => {
    const mockBus = {
      busName: 'Test Bus',
      source: 'Test Source',
      destination: 'Test Destination',
      boardingTime: new Date(),
      droppingTime: new Date(),
      numberOfSeats: 10,
      price: 100
    };
    const response = await request(app)
      .post('/add-bus')
      .send(mockBus);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Bus Created Sucessfully');
    expect(response.body.Addedbus).toHaveProperty('_id');
    expect(response.body.Addedbus.busName).toBe(mockBus.busName);
    expect(response.body.Addedbus.source).toBe(mockBus.source);
    expect(response.body.Addedbus.destination).toBe(mockBus.destination);
    expect(response.body.Addedbus.numberOfSeats).toBe(mockBus.numberOfSeats);
    expect(response.body.Addedbus.price).toBe(mockBus.price);
  });
});


describe('PUT /update-status/:id', () => {
  it('should update seat status and increment the numberOfSeats in Bus', async () => {
    const seat = {
      bus: '614c3d3cf3c5c9156b98c6ba',
      busName: 'Bus 1',
      seatNumber: 1,
      status: true,
      price: 100,
      selected: false
    }
    const savedSeat = await Seats.create(seat);

    const res = await request(app)
      .put(`/update-status/${savedSeat._id}`)
      .send({ status: false })
      .expect(200);

    expect(res.body.message).toEqual('Status Updated Successfully !!!');

    const updatedSeat = await Seats.findById(savedSeat._id);
    expect(updatedSeat.status).toEqual(false);

  });

  it('should return 401 if seat not found', async () => {
    const res = await request(app)
      .put('/update-status/614c3d3cf3c5c9156b98c6ba')
      .send({ status: false })
      .expect(401);

    expect(res.body.message).toEqual('Not updated please check your inputs');
  });

  it('should return 500 if server error occurs', async () => {
    jest.spyOn(Seats, 'findByIdAndUpdate').mockRejectedValue(new Error());

    const res = await request(app)
      .put('/update-status/614c3d3cf3c5c9156b98c6ba')
      .send({ status: false })
      .expect(500);

    expect(res.body.message).toEqual('Internal server error !!!');
  });
});

describe('GET /get-users', () => {
  it('should return all users data', async () => {
    const testData = [{ name: 'John', email: 'john@example.com', phone: '1234567890' },
    { name: 'Jane', email: 'jane@example.com', phone: '0987654321' }];

    jest.spyOn(Ticket, 'find').mockResolvedValue(testData);

    const res = await request(app)
      .get('/get-users')
      .expect(200);

    expect(res.body).toEqual(testData);
  });

  it('should return 500 if server error occurs', async () => {
    jest.spyOn(Ticket, 'find').mockRejectedValue(new Error());

    const res = await request(app)
      .get('/get-users')
      .expect(500);

    expect(res.body.message).toEqual('something went wrong');
  });
});

describe('/buses', () => {

  it(`should return all the buses`, async () => {
    const bus = [{

      busName: "Then-molzhi travels",
      source: "Chennai",
      destination: "Salem",
      numberOfSeats: 5,
      boardingTime: "2023-05-10",
      droppingTime: "2023-05-11",
      price: 699
    },
    {
      busName: "Ak travels",
      source: "Chennai",
      destination: "Salem",
      numberOfSeats: 12,
      boardingTime: "2023-05-10",
      droppingTime: "2023-05-11",
      price: 699
    }];

    jest.spyOn(Bus, 'find').mockResolvedValue(bus);
    const res = await request(app)

      .get('/buses')
      .expect(200);

    expect(res.body).toEqual(bus);
  });
});

describe('GET /get-seats/:id', () => {
  it('should return seats for a valid bus ID', async () => {
    const seat = {
      bus: '614c3d3cf3c5c9156b98c6ba',
      busName: 'Bus 1',
      seatNumber: 1,
      status: true,
      price: 100,
      selected: false
    };
    const savedSeat = await Seats.create(seat);

    const res = await request(app)
      .get(`/get-seats/${savedSeat.bus}`);
    expect(res.status).toBe(200);
  });

  it('should return a 404 status for an invalid bus ID', async () => {
    const res = await request(app).get('/get-seats/invalid-id');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Something went wrong please check inputs' });
  });

});


describe('GET /user-history', () => {
  it('should return user history for a valid email', async () => {
    const userEmail = 'example@example.com';
    const mockData = [
      {
        busName: 'Bus A',
        journeyDate: '2023-05-15',
        passengerName: 'John Doe',
        mobileNumber: '1234567890',
        age: 30,
        status: 'booked',
        seatNumber: 'A1',
        fare: 100,
        busId: '60a819abf1b62b10d0a356b1',
        seatId: '60a819abf1b62b10d0a356b2',
        userEmail: userEmail,
      },

    ];

    Ticket.find = jest.fn().mockResolvedValue(mockData);

    const response = await request(app).get(`/user-history?userEmail=${userEmail}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockData);
  });

  it('should return a "No users found" message for an error', async () => {
    const userEmail = 'example@example.com';

    Ticket.find = jest.fn().mockRejectedValue(new Error('Database error'));

    const response = await request(app).get(`/user-history?userEmail=${userEmail}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'No users found !!' });
  });
});

describe('PUT /update-bus/:id', () => {
  it('should update a bus and its seats', async () => {
    const bus = new Bus({
      busName: 'Test Bus',
      source: 'Test Source',
      destination: 'Test Destination',
      boardingTime: new Date(),
      droppingTime: new Date(),
      duration: 10,
      numberOfSeats: 10,
      price: 100
    });

    const savedBus = await bus.save();
    const busId = savedBus._id;

    const seats = [];
    for (let i = 1; i <= savedBus.numberOfSeats; i++) {
      seats.push({
        bus: busId,
        busName: savedBus.busName,
        seatNumber: i,
        status: true,
        price: savedBus.price,
        selected: false
      });
    }

    await Seats.insertMany(seats);

    const updatedBusData = {
      busName: 'Updated Bus',
      source: 'Updated Source',
      destination: 'Updated Destination',
      boardingTime: new Date(),
      droppingTime: new Date(),
      numberOfSeats: 20,
      price: 200
    };

    const response = await request(app)
      .put(`/update-bus/${busId}`)
      .send(updatedBusData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Bus and seats updated successfully');

    const updatedBus = await Bus.findById(busId);
    expect(updatedBus.busName).toBe(updatedBusData.busName);
    expect(updatedBus.source).toBe(updatedBusData.source);
    expect(updatedBus.destination).toBe(updatedBusData.destination);
    expect(updatedBus.numberOfSeats).toBe(updatedBusData.numberOfSeats);
    expect(updatedBus.price).toBe(updatedBusData.price);

    const updatedSeats = await Seats.find({ bus: busId });
    expect(updatedSeats.length).toBe(updatedBusData.numberOfSeats);
    expect(updatedSeats[0].seatNumber).toBe(1);
    expect(updatedSeats[updatedSeats.length - 1].seatNumber).toBe(updatedBusData.numberOfSeats);
  });

  it('should handle error when updating bus', async () => {
    const response = await request(app)
      .put('/update-bus/invalid-id')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('An error occurred while updating the bus');
  });
});
describe('GET /search-avail-buses', () => {
  it('should search for available buses and return results', async () => {
    // Create some buses for testing
    const bus1 = new Bus({
      busName: 'Test Bus 1',
      source: 'Source 1',
      destination: 'Destination 1',
      boardingTime: new Date(),
      droppingTime: new Date(),
      duration: 5,
      numberOfSeats: 10,
      price: 100
    });

    const bus2 = new Bus({
      busName: 'Test Bus 2',
      source: 'Source 2',
      destination: 'Destination 2',
      boardingTime: new Date(),
      droppingTime: new Date(),
      duration: 6,
      numberOfSeats: 15,
      price: 120
    });

    await bus1.save();
    await bus2.save();

    const response = await request(app)
      .get('/search-avail-buses')
      .query({
        source: 'Source 1',
        destination: 'Destination 1',
        boardingTime: new Date().toISOString(),
      });

    expect(response.status).toBe(200);
    expect(response.body.buses[0].busName).toBe('Then-molzhi travels');
    expect(response.body.buses[0].source).toBe('Chennai');
    expect(response.body.buses[0].destination).toBe('Salem');
  });

  it('should handle error when searching for buses', async () => {
    const response = await request(app)
      .get('/search-avail-buses')
      .query({
        source: 'Invalid Source',
        destination: 'Invalid Destination',
        boardingTime: new Date().toISOString(),
        sortBy: 'duration',
        page: 1,
        limit: 5
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error occurred while searching for buses.');
  });
});





