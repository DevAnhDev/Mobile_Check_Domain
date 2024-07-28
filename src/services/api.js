import axios from 'axios';
import { apiURL } from '../constain';


export const fetchDataLongPoling = async (url) => {
  try {
    console.log(apiURL+url)
    const response = await fetch(apiURL+url);
    return response.data;
  } catch (error) {
    console.log(error)
    throw error;
  }
};

// Hàm lấy tất cả dữ liệu
export const fetchData = async (url) => {
  try {
    console.log(apiURL+url)
    const response = await axios.get(apiURL+url);
    return response.data;
  } catch (error) {
    console.log(error)
    throw error;
  }
};

// Hàm tạo mới dữ liệu
export const createPost = async (url, newPost) => {
  try {
    const response = await axios.post(apiURL+url, newPost);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hàm cập nhật dữ liệu
export const updatePost = async (url, id, updatedPost) => {
  try {
    const response = await axios.put(`${apiURL+url}/${id}`, updatedPost);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePostNetwork = async (url, id, check, updatedPost) => {
  console.log("ủl: ",`${apiURL+url}/${id}/${check}`)
  try {
    const response = await axios.put(`${apiURL+url}/${id}/${check}`, updatedPost);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hàm xóa dữ liệu
export const deletePost = async (url,id) => {
  try {
    await axios.delete(`${apiURL+url}/${id}`);
  } catch (error) {
    throw error;
  }
};
