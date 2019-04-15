const expect = require('chai').expect;
const request = require('supertest');
const utils = require('../server/utils/utils');

const app = require('../server/server');

beforeEach((done) => {
    utils.clearDatabase(done);
});

describe('Signup', () => {
    it('should create an account', (done) => {
        request(app).post('/auth/signup')
            .send({
                email: "userradu91@gmail.com",
                password: "password",
                confirm_password: "password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(201);
                done();
            })
    });

    it('shoud throw an error if the required fields are not specified', (done) => {
        request(app).post('/auth/signup')
            .send({})
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                done();
            })
    });

    it('shoud throw an error if the email is not valid', (done) => {
        request(app).post('/auth/signup')
            .send({
                email: "invalidEmail",
                password: "password",
                confirm_password: "password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                done();
            })
    });

    it('shoud throw an error if the passwords do not match', (done) => {
        request(app).post('/auth/signup')
            .send({
                email: "userradu91@gmail.com",
                password: "password",
                confirm_password: "another password"
            })
            .end((err, res) => {
                expect(res.statusCode).to.equal(400);
                done();
            })
    });
});