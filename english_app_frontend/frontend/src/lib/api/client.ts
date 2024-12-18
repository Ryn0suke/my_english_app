import axios from 'axios';

const options = {
    ignoreHeaders: true
};

const client = axios.create({
    //baseURL: 'http://localhost:3000/api/v1'
    baseURL: 'https://ryueng.com/api/v1'
});

export default client;