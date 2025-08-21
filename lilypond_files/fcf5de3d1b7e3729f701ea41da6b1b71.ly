\version "2.20.0"
\include "articulate.ly"
\paper {
  indent = 0\mm
  short-indent = 0\mm
  
    paper-width = 4\in
    
      page-breaking = #ly:one-page-breaking
    
  
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
  \relative c'' { 
    c4 d e c c d e c
    e4 f g2 e4 f g2
    g8 a g f e4 c g'8 a g f e4 c
    c4 g c2 c4 g c2
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