\version "2.20.0"
\include "articulate.ly"
\paper {
  indent = 0\mm
  short-indent = 0\mm
  
    page-breaking = #ly:one-line-breaking
  
  left-margin = 4\mm
  right-margin = 4\mm
  top-margin = 4\mm
  bottom-margin = 4\mm
  oddHeaderMarkup = ##f
  evenHeaderMarkup = ##f
  oddFooterMarkup = ##f
  evenFooterMarkup = ##f
}
\score {
  {
  \key g \major
  \relative c' { 
  \repeat volta 2 {
    \partial 4
    d'8 c b4 d g, b e,2 d4
    g fis8 g a b c4 b
  }
  \alternative {
    { b2 a4 }
    { g2. }
  }
}
  }
  \layout { 
    #(layout-set-staff-size 16)
    \context {
      \Lyrics
      
      
    }
  }
  \midi { 
    \tempo 4 = 120
  }
}