const expect = require('chai').expect;
const request = require('supertest');
const utils = require('../server/utils/utils');
const User = require('../server/api/user/userModel');
const Habit = require('../server/api/habit/habitModel');
const History = require('../server/api/history/historyModel');

const app = require('../server/server');

describe('History', () => {

    const userDetails = {
        email: "user@email.com",
        password: "password"
    }

    let token = null;
    let userId = null;
    let habitId = null;

    before((done) => {
        utils.clearDatabase(() => {
            utils.generateHash("password")
                .then((hash) => {
                    const user = new User({
                        email: userDetails.email,
                        password: hash,
                        verified: true
                    });
                    return user.save();
                })
                .then((user) => {
                    userId = user._id;

                    const habit = new Habit({
                        name: 'habit',
                        user: userId
                    });

                    return habit.save();
                })
                .then((habit) => {
                    habitId = habit._id;
                    
                    request(app)
                        .post('/api/auth/login')
                        .send(userDetails)
                        .end((err, res) => {
                            token = res.body.token;
                            done();
                        })
                })
        });
    });

    beforeEach((done) => {
        History.deleteMany({}, () => {
            done();
        });
    });

    it('should get the history for a habit', (done) => {

        request(app)
            .get(`/api/history/${habitId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.property('history');
                expect(res.body.history).to.be.an('array');
                done();
            });
    });

    it('should get the history for a habit filtered by year and month', (done) => {

        const arr = [
            {
                habit: habitId,
                date: "2019-05-01T00:00:00.000Z"
            },
            {
                habit: habitId,
                date: "2019-04-01T00:00:00.000Z"
            }
        ];

        History.create(arr, () => {
            request(app)
                .get(`/api/history/${habitId}?year=2019&month=4`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.property('history');
                    expect(res.body.history).to.be.an('array');
                    expect(res.body.history.length).to.equal(1);
                    done();
                });
        });
    });

    it('should add a completed date', (done) => {

        const date = "2019-05-01T00:00:00.000Z";

        request(app)
            .post(`/api/history/${habitId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                date: date
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.body).to.have.property('date');
                expect(res.body.date).to.equal(date);
                done();
            });
    });

    it("should return 404 when trying to delete a complated date which doesn't exits", (done) => {

        const date = "2019-05-01T00:00:00.000Z";

        request(app)
            .delete(`/api/history/${habitId}/${date}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(404);
                expect(res.body).to.eql({
                    error: 'The specified date does not exist'
                });
                done();
            });
    });

    it('should remove a completed date', (done) => {
        const date = "2019-05-01T00:00:00.000Z";

        const history = new History({
            habit: habitId,
            date: date
        });

        history.save(() => {
            request(app)
                .delete(`/api/history/${habitId}/${date}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.property('message');
                    expect(res.body.message).to.equal('The date was removed');
                    done();
                });
        });
    });
});