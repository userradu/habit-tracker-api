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
});