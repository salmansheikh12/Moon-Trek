const axios = require('axios');

const getPositions = async (timeStamp, longitude, latitude) => {
    const response = await axios.get(
        'http://localhost:8888/positions/',
        {
            params: {
                timeStamp,
                longitude,
                latitude,
            }
        }
    );

    return response.data;
};

(
    async () => {
        for (let i = 0; i < 24; i++) {
            const timeStamp = `2023-03-04T${i}:00:00`;
            const positions = await getPositions(timeStamp, 34, -118);

            console.log(`${timeStamp}\t ${positions.moon.x}\t ${positions.moon.y}\t ${positions.moon.z}\t ${positions.sun.x}\t ${positions.sun.y}\t ${positions.sun.z}`);
        }
    }
)();