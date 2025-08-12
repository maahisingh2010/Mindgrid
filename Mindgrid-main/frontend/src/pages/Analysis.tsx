import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

const Analysis = () => {
  const { debateId } = useParams();
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    fetch(`http://localhost:8000/analysis/${debateId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAnalysis(data.analysis));
  }, [debateId]);

  return (
    <div className="min-h-screen bg-gradient-bg text-foreground p-8">
      <Card className="max-w-2xl mx-auto bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center">
            <Brain className="mr-2" />
            Debate Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{analysis}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analysis;
