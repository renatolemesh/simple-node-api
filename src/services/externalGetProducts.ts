import axios, { AxiosRequestConfig } from 'axios';
import https from 'https';

const fetchProducts = async () => {
  const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // Disable SSL validation

  const options: AxiosRequestConfig = {
    method: 'GET',
    url: 'https://delivery.livn.com.br/api/v1/product/1/8',
    httpsAgent, // 
    headers: {
      authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJJc0lBIjpmYWxzZSwiZXhwIjoxNzU3NjM4NTMyLCJpZCI6NTQxLCJlbWFpbCI6IiIsInN0b3JlIjoiNTkwNDE2MjAwMDAxMTEiLCJpc3MiOiJKQ1NTIEZPT0QgU0VSVklDRVMgTFREQSIsInN5bmMiOmZhbHNlLCJzY2hlbWEiOiJsaWZlcG9rZWl0YWltYmliaSIsImNhdGFsb2ciOjc5LCJkZXBhcnRtZW50IjoxLCJtZW51IjoxfQ.Oi9kMO5cbn6l1ypIj9GFA2GLQRuXMSJve4lc11egdrE',
      store: '59041620000111',
      token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJJc0lBIjpmYWxzZSwiZXhwIjoxNzU3NjM4NTMyLCJpZCI6NTQxLCJuYW1lIjoiIiwiZW1haWwiOiIiLCJzdG9yZSI6IjU5MDQxNjIwMDAwMTExIiwiY2F0YWxvZyI6NzksImRlcGFydG1lbnQiOjEsIm1lbnUiOjEsInNjaGVtYSI6ImxpZmVwb2tlaXRhaW1iaWJpIiwic3luYyI6ZmFsc2UsInVzZXIiOjEsImNvbXBhbnkiOjQsImRldmljZWlkIjo0LCJpc3MiOiJMSUZFIFBPS0UgSVRBSU0gQklCSSJ9.awqQfm9G-wlzDaPKI05qpmDY1O9KK6J-UMAQELWPmts',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export default fetchProducts;
