#!/usr/bin/env -S ipython --matplotlib=auto

#%%
import matplotlib.pyplot as pp
import numpy as np
import os

path = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(path, 'apr-of.2.txt')
data = np.genfromtxt(path)
tgts = data[:,2] / 1000
aprs = data[:,1] / 1000
idxs = data[:,0]
zero = np.zeros(data.shape[0])

pp.plot(idxs, tgts, color='black')
pp.plot(idxs, aprs, color='black', linestyle='--')
pp.fill_between(idxs, tgts, aprs, where=tgts>=0, color='r', alpha=0.5)
pp.fill_between(idxs, aprs, where=aprs>=0, color='b', alpha=0.5)

pp.title('APR Reparametrization', fontweight='bold')
pp.legend(['APR target', 'APR value'])
pp.ylabel('Multiple')
pp.xlabel('Months')
pp.grid()

#%%
if __name__ == '__main__':
    pp.show(block=True)
