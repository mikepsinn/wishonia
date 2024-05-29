// apiUtils.ts
export const postVoteData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        let referrerUserId = localStorage.getItem('referrerUserId');
        localStorage.removeItem('referrerUserId');
        const wishingWellPairAllocation = localStorage.getItem('wishingWellPairAllocation');
        localStorage.removeItem('wishingWellPairAllocation');
        const globalProblemPairAllocation = localStorage.getItem('globalProblemPairAllocation');
        localStorage.removeItem('globalProblemPairAllocation');
        const data = {
            referrerUserId: referrerUserId || undefined,
            wishingWellPairAllocation: undefined,
            globalProblemPairAllocation: undefined,
        }
        if (wishingWellPairAllocation) {
            data.wishingWellPairAllocation = JSON.parse(wishingWellPairAllocation);
        }
        if (globalProblemPairAllocation) {
            data.globalProblemPairAllocation = JSON.parse(globalProblemPairAllocation);
        }
        if (!referrerUserId && !wishingWellPairAllocation && !globalProblemPairAllocation) {
            resolve('No data to post to vote endpoint');
            return;
        }
        fetch('/api/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                resolve(data);
            })
            .catch((error) => {
                console.error('Error:', error);
                reject(error);
            });
    });
};