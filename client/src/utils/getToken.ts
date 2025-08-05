const getToken = () => {
  return localStorage.getItem('accessToken');
};

export default getToken;