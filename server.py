import asyncio
import websockets
import numpy as np
import math as mt

initial_move = '0.0'
integral = 0
previous_error = 0

minPos = None
uMax = 1.0
dt = 0.1
filterU = 0.5

def state_transition_fnc(x, y, u, fase):
    if fase == 1:
        return [-5.2*x + 2.5*y + 3.2*u, -9*x - 0.8*y + 5.0*u]
    if fase == 2:
        return [5.0*y, -0.9*y -9.0*x + 5*u]
    if fase == 3:
        return [2.0*y - 1.2*x, -0.4*y + 3.6*x - 5*u]
    if fase == 4:
        return [1.0*x - 0.4*y + 0.6*u, 1.8*x + 0.2*y - 5.0*u]

def closest_distance_to_positions(targetX, targetY, positions):
    dMin = 10000.0

    for i in range(len(positions)):
        p = positions[i]
        d = ((p[0] - targetX) ** 2 + (p[1] - targetY) ** 2) + 0.001 * i

        if d < dMin:
            dMin = d
    return dMin

def future_positions(x, y, U, fase):
    positions = []
    NBlocks = len(U)
    U = np.append(U, U[NBlocks-1])
    p = [x, y]
    N = 10
    for i in range(N):
        positions.append([p[0],p[1]])
        uIndex = mt.floor(NBlocks * i / N)
        u = U[uIndex]
        xp = state_transition_fnc(p[0], p[1], u, fase)
        p[0] += xp[0]*dt
        p[1] += xp[1]*dt
    return positions


def controller(data):
    data_sep = data.split(',')

    targetX = float(data_sep[5])
    targetY = float(data_sep[6])
    x = float(data_sep[3])
    y = float(data_sep[4])
    fase = int(data_sep[2])
    uStar1 = 0.0
    dMinim = 10000.0

    values = [x / 10 for x in range(-10, 11)] 
    for ut1 in values:
        for ut2 in values:
            positions = future_positions(x, y, [ut1, ut2], fase)
            d = closest_distance_to_positions(targetX, targetY, positions)
            if d < dMinim:
                dMinim = d
                uStar1 = ut1
    return uStar1

async def handle_client(websocket, path):
    print("Client connected")
    i = 0
    response = 0.0
    try:
        while True:
            if i==0:
                # Send contact to the client
                await websocket.send(initial_move)

            # Receive data from the client
            data = await websocket.recv()
            print("Received data from client: ", data)

            # Process the received data and prepare the filtered response
            response = filterU*response + (1.0-filterU)*controller(data)
            response = min(1.0, max(-1.0, response))
            print("Response: ", response)

            # Send the response back to the client
            await websocket.send(str(response))
            i += 1
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")

async def main():
    # Set up the server
    server = await websockets.serve(handle_client, "localhost", 6660)

    # Start the server
    print("Server started")
    await server.wait_closed()

asyncio.run(main())
