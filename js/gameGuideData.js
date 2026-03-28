(function () {
  window.GAME_RULES_GUIDE = {
    title: "Instrukcja Gry: Athoria battlegrounds",
    body: `WPROWADZENIE
To jest taktyczna gra turowa 1v1. Budujesz druzyne, wystawiasz jednostki i walczysz o eliminacje przeciwnika oraz kontrole ognisk. Gra jest szybka, ale wymaga planowania pozycji, AP i kolejnosci aktywacji.

====================
TWORZENIE ARMII (BUILDER)
====================
1. Wejdz w Single Player i wybierz frakcje.
2. W kreatorze modelu wybierz:
   - Typ jednostki
   - Pancerz
   - Bron glowna
   - Dodatkowe bronie (opcjonalnie)
   - Liczebnosc oddzialu
3. Kliknij "Dodaj model", aby dodac konfiguracje do swojej armii.
4. Pilnuj limitu punktow: 115.
5. Gdy armia jest gotowa, kliknij "Start".

Jak czytac koszt w builderze:
- Koszt modelu = koszt bazowy jednostki + koszt pancerza + koszt broni.
- Koszt oddzialu = koszt modelu x liczebnosc oddzialu.
- Im wiekszy oddzial, tym wiecej atakow i save, ale szybciej zjada limit punktow.

Szybkie wskazowki budowania armii:
- Miej minimum 1 jednostke z sensowna bronia dystansowa.
- Miej minimum 1 twarda jednostke do trzymania celu.
- Nie pakuj wszystkiego w 1 super drogiego heroica.
- Tanie oddzialy daja kontrole mapy, elity daja nacisk bojowy.

====================
FAZY MECZU
====================
1. Deployment: obie strony wystawiaja jednostki turami.
2. Aktywacje: kazda jednostka moze aktywowac sie raz na runde.
3. Koniec rundy: gdy obie strony nie maja juz dostepnych aktywacji, zaczyna sie nowa runda.

====================
AP I AKCJE
====================
Typowa aktywacja gracza:
1. Wybierz jednostke.
2. Wydaj AP na akcje (Move, Dash, Atak/Szarza/Strzal, Capture).
3. Zakoncz ture recznie albo wyczerp AP.

Glowne akcje:
- Move: standardowy ruch.
- Dash: dodatkowy ruch za AP (kanal bonusowy).
- Attack/Shoot/Charge: akcje bojowe.
- Capture: przejecie ogniska.

====================
ODDZIALY, HP I DEGRADACJA MODELI
====================
- Kazdy oddzial ma wspolna pule HP.
- Jednoczesnie oddzial ma liczbe aktywnych modeli.
- Gdy oddzial straci HP rowne HP jednego modelu, traci 1 aktywny model.
- Mniej aktywnych modeli = mniej kosci ataku i mniej puli save.

Leczenie i brak wskrzeszania:
- Ogniska lecza HP, ale nie odtwarzaja utraconych modeli.
- Leczenie ma limit odtworzenia (maxRecoverableHp), ktory spada po utracie modeli.

====================
WALKA: KROK PO KROKU
====================
1. Atakujacy rzuca atak.
2. Obronca rzuca save.
3. Nalicza sie obrazenia po zablokowanych trafieniach.
4. Jesli to walka wrecz i obronca zyje, moze wejsc kontra za nietrafione ataki.

Kontra:
- Kontra odpala sie za nietrafione ataki napastnika.
- Kontra nie odpala kolejnej kontry (brak lancucha).

====================
SAVE I KEYWORDY
====================
Save oddzialow:
- Save pool = 2 kosci na kazdy aktywny model oddzialu.

Keywordy:
- Keywordy broni i pancerza zmieniaja skutecznosc ataku/obrony.
- Przykklady: Brutal, Strength, Penetrate, Ceaseless, Block, Dodge, Endurance.
- Keywordy nie stackuja sie per model oddzialu; sa cecha profilu jednostki/broni.

====================
SZARZA I STRZAL
====================
Szarza:
- To atak kontaktowy z bonusami i karami.
- Daje dodatkowe kosci ataku (zaleznie od aktywnych modeli atakujacego),
  oslabia pule save obroncy,
  i pogarsza hit kontry obroncy.

Strzal:
- Wymaga czystej linii strzalu.
- Nie dziala, gdy przeciwnik jest za blisko (strefa zwarcia).
- Bronie Heavy maja ograniczenia po ruchu.

====================
CELE (OGNISKA)
====================
- Ognisko przejmujesz akcja Capture, bedac odpowiednio blisko.
- Kontrolowane ognisko daje leczenie jednostkom swojej strony w zasiegu.
- Ogniska sa bardzo wazne strategicznie: daja sustain i wymuszaja walke o teren.

====================
MAPA I TEREN
====================
- Teren blokujacy utrudnia ruch i linie ataku.
- Dobre ustawienie za przeszkodami jest czesto lepsze niz "goły" DPS.
- Walcz o katy i odcinki mapy, nie tylko o frontalne starcie.

====================
NAJCZESTSZE BLEDY NOWYCH GRACZY
====================
1. Przepalanie AP na zlych jednostkach na poczatku rundy.
2. Ignorowanie ognisk i granie tylko na zabijanie.
3. Wystawianie elit bez oslony i wsparcia.
4. Brak jednostki dystansowej w skladzie.
5. Nieczytanie keywordow pancerza i broni.

====================
SZYBKI START (30 SEKUND)
====================
1. Zbuduj armie do 115 punktow.
2. Wystaw jednostki na deployment.
3. Wez najblizsze ognisko i utrzymaj je.
4. Atakuj celami priorytetowymi, nie "najblizsze za wszelka cene".
5. Rotuj aktywacje tak, by nie zostac bez odpowiedzi na ruch przeciwnika.`
  };
})();
