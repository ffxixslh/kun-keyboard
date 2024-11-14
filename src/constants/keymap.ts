import ay from '/src/assets/audios/ay.mp3'
import c from '/src/assets/audios/c.mp3'
import grlxs from '/src/assets/audios/grlxs.mp3'
import hh from '/src/assets/audios/hh.mp3'
import jntm from '/src/assets/audios/jntm.mp3'
import lanqiu from '/src/assets/audios/lanqiu.wav'
import music from '/src/assets/audios/music.wav'
import ngmay from '/src/assets/audios/ngmay.wav'
import qmzzrmdjh from '/src/assets/audios/qmzzrmdjh.mp3'
import rap from '/src/assets/audios/rap.mp3'
import tiao from '/src/assets/audios/tiao.wav'
import ctrl from '/src/assets/audios/ctrl.wav'
import ji_ni_tai_mei from '/src/assets/musics/ji_ni_tai_mei.mp3'

export const KEY_MUSIC_MAP: Record<string, string> = {
  a: ay,
  c: c,
  g: grlxs,
  h: hh,
  j: jntm,
  l: lanqiu,
  m: music,
  n: ngmay,
  q: qmzzrmdjh,
  r: rap,
  t: tiao,
  Control: ctrl,
  ['1']: ji_ni_tai_mei,
}
