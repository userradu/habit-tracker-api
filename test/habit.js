const expect = require('chai').expect;
const request = require('supertest');
const utils = require('../server/utils/utils');
const User = require('../server/api/user/userModel');
const Habit = require('../server/api/habit/habitModel');
const jwt = require('jsonwebtoken');
const config = require('../server/config/config');
const mongoose = require('mongoose');

const app = require('../server/server');

describe("Habits", () => {

    const userDetails = {
        email: "user@email.com",
        password: "password"
    }

    let token = null;
    let userId = null;

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
                .then(() => {
                    request(app)
                        .post('/api/auth/login')
                        .send(userDetails)
                        .end((err, res) => {
                            token = res.body.token;
                            decoded = jwt.verify(token, config.jwt_secret);
                            userId = decoded._id;
                            done();
                        })
                })
        });
    });

    beforeEach((done) => {
        Habit.deleteMany({}, () => {
            done();
        });
    })

    it('should get all the habits', (done) => {
        request(app)
            .get('/api/habits')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.property('habits');
                expect(res.body.habits).to.be.an('array');
                done();
            });
    });

    it('should throw an error if the name field is missing when creating a habit', (done) => {
        request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.eql({
                    error: 'The habit name is required'
                });
                done();
            });
    });

    it('should not create a habit if the name is taken', (done) => {
        const habit = new Habit({
            name: 'habit',
            user: userId
        });

        habit.save(() => {
            request(app)
                .post('/api/habits')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'habit' })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(409);
                    expect(res.body).to.eql({
                        error: 'The habit already exists'
                    });
                    done();
                });
        });
    });

    it('should create a habit', (done) => {
        request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'habit'
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(201);
                expect(res.body).to.have.property('_id');
                expect(res.body).to.have.property('name');
                done();
            });
    });

    it("should return 404 when trying to get a habit which doesn't exists", (done) => {
        const id = mongoose.Types.ObjectId();
        request(app)
            .get(`/api/habits/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(404);
                expect(res.body).to.eql({
                    error: 'The habit does not exist'
                });
                done();
            });
    });

    it('should get a habit by an id', (done) => {
        const habit = new Habit({
            name: 'habit',
            user: userId
        });

        habit.save(() => {
            request(app)
                .get(`/api/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.property('_id');
                    expect(res.body).to.have.property('name');
                    done();
                });
        });
    });

    it("should return 404 when trying to update a habit which doesn't exits", (done) => {
        const id = mongoose.Types.ObjectId();
        request(app)
            .put(`/api/habits/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'habit'
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(404);
                expect(res.body).to.eql({
                    error: 'The habit does not exist'
                });
                done();
            });
    });

    it("should throw an error if the name is missing when trying to update a habit", (done) => {
        const habit = new Habit({
            name: 'habit',
            user: userId
        });

        habit.save(() => {
            request(app)
                .put(`/api/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({})
                .end((err, res) => {
                    expect(res.statusCode).to.equal(400);
                    expect(res.body).to.eql({
                        error: 'The habit name is required'
                    });
                    done();
                });
        });
    });

    it("should throw an error if the name is taken when trying to update a habit", (done) => {
        const habits = [
            {
                name: 'read',
                user: userId
            },
            {
                name: 'exercise more',
                user: userId
            }
        ];

        Habit.create(habits, (err, habits) => {
            request(app)
                .put(`/api/habits/${habits[0]._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'exercise more'
                })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(409);
                    expect(res.body).to.eql({
                        error: 'The habit name is taken'
                    });
                    done();
                });
        })
    });

    it("should update a habit", (done) => {
        const habit = new Habit({
            name: 'habit',
            user: userId
        });

        habit.save(() => {
            request(app)
                .put(`/api/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'habitNameModified'
                })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body.name).to.equal("habitNameModified");
                    done();
                });
        });
    });

    it("should update a habit (same name)", (done) => {
        const habit = new Habit({
            name: 'habit',
            user: userId
        });

        habit.save(() => {
            request(app)
                .put(`/api/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'habit'
                })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body.name).to.equal("habit");
                    done();
                });
        });
    });

    it("should return 404 when trying to delete a habit which doesn't exits", (done) => {
        const id = mongoose.Types.ObjectId();
        request(app)
            .delete(`/api/habits/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.statusCode).to.equal(404);
                expect(res.body).to.eql({
                    error: 'The habit does not exist'
                });
                done();
            });
    });

    it("should delete a habit", (done) => {
        const habit = new Habit({
            name: 'habit',
            user: userId
        });

        habit.save(() => {
            request(app)
                .delete(`/api/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    done();
                });
        });
    });
});