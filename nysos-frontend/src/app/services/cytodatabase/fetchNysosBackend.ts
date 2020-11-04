// const url =
//   'https://europe-west1-nysos-289715.cloudfunctions.net/nysos-backend';
const url = 'http://localhost:3000';
export const fetchAllData = (authToken: string) =>
  fetch(`${url}/data?token=${authToken}`, {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const postContent = (
  authToken: string,
  contentId: string,
  content: string
): Promise<any> =>
  fetch(`${url}/content/${contentId}?token=${authToken}`, {
    method: 'POST',
    mode: 'cors',
    cache: 'default',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contentId, content }),
  }).then((res: Response) => res.json());

export const postData = (authToken: string, objectId: string, data: object) =>
  fetch(`${url}/data/${objectId}?token=${authToken}`, {
    method: 'POST',
    mode: 'cors',
    cache: 'default',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ objectId, data }),
  });

export const fetchContent = (authToken: string, contentId: string) =>
  fetch(`${url}/content/${contentId}?token=${authToken}`, {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    if (res.status == 200) return res.json();
    if (res.status == 401) throw { name: 'NotLoggedIn' };
    if (res.status == 404) throw { name: 'ContentNotFound' };
  });
export const deleteAllMyData = (authToken: string) =>
  fetch(`${url}?token=${authToken}`, {
    method: 'DELETE',
    mode: 'cors',
    cache: 'default',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    if (res.status == 200) return res.json();
    if (res.status == 401) throw { name: 'NotLoggedIn' };
    if (res.status == 400) throw { name: 'Failed' };
  });

export const deleteDataOfElement = (authToken: string, elementId: string) =>
  fetch(`${url}/${elementId}?token=${authToken}`, {
    method: 'DELETE',
    mode: 'cors',
    cache: 'default',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    if (res.status == 200) return res.json();
    if (res.status == 401) throw { name: 'NotLoggedIn' };
    if (res.status == 400) throw { name: 'Failed' };
  });

export const apiIsReachable = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 3000);
    fetch(`${url}/`, { mode: 'no-cors' }).then((res) => {
      resolve(res.status === 0);
      clearTimeout(timeout);
    });
  });
};
