const url =
  'https://europe-west1-nysos-289715.cloudfunctions.net/nysos-backend';

export const fetchAllData = (authToken: string) =>
  fetch(`${url}/data?token=${authToken}`, {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentId, content }),
  }).then((res: Response) => res.json());

export const postData = (authToken: string, objectId: string, data: object) =>
  fetch(`${url}/data/${objectId}?token=${authToken}`, {
    method: 'POST',
    mode: 'cors',
    cache: 'default',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objectId, data }),
  });

export const fetchContent = (authToken: string, contentId: string) =>
  fetch(`${url}/content/${contentId}?token=${authToken}`, {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.json());