from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from sqlalchemy import func

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://usuario:senha@localhost/nome_do_banco'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo para a tabela
class CaixaAgua(db.Model):
    __tablename__ = 'caixa_agua'
    id_caixa = db.Column(db.Integer, primary_key=True)
    data_registro = db.Column(db.DateTime, nullable=False)
    nivel = db.Column(db.Float, nullable=False)
    temperatura = db.Column(db.Float, nullable=False)
    pureza = db.Column(db.Float, nullable=False)

# Rota para obter o último registro de um certo id_caixa
@app.route('/caixa/<int:id_caixa>/ultimo', methods=['GET'])
def get_ultimo_registro(id_caixa):
    ultimo_registro = (db.session.query(CaixaAgua)
                       .filter_by(id_caixa=id_caixa)
                       .order_by(CaixaAgua.data_registro.desc())
                       .first())
    
    if ultimo_registro:
        return jsonify({
            'id_caixa': ultimo_registro.id_caixa,
            'data_registro': ultimo_registro.data_registro,
            'nivel': ultimo_registro.nivel,
            'temperatura': ultimo_registro.temperatura,
            'pureza': ultimo_registro.pureza
        })
    else:
        return jsonify({'error': 'Registro não encontrado'}), 404

@app.route('/caixa/<int:id_caixa>/media', methods=['GET'])
def get_media_registros(id_caixa):
    periodo = request.args.get('periodo')
    hoje = datetime.now()

    if periodo == 'dia':
        delta = timedelta(days=1)
        formato_data = func.date(CaixaAgua.data_registro)
    elif periodo == 'semana':
        delta = timedelta(weeks=1)
        formato_data = func.yearweek(CaixaAgua.data_registro)
    elif periodo == 'mes':
        delta = timedelta(days=30)
        formato_data = func.date_format(CaixaAgua.data_registro, '%Y-%m')
    else:
        return jsonify({'error': 'Período inválido. Use dia, semana ou mes.'}), 400

    data_inicio = hoje - delta
    registros = (db.session.query(
                    formato_data.label('periodo'),
                    func.avg(CaixaAgua.nivel).label('nivel_medio'),
                    func.avg(CaixaAgua.temperatura).label('temperatura_media'),
                    func.avg(CaixaAgua.pureza).label('pureza_media'))
                 .filter(CaixaAgua.id_caixa == id_caixa, CaixaAgua.data_registro >= data_inicio)
                 .group_by('periodo')
                 .all())

    return jsonify([
        {
            'periodo': str(registro.periodo),
            'nivel_medio': registro.nivel_medio,
            'temperatura_media': registro.temperatura_media,
            'pureza_media': registro.pureza_media
        }
        for registro in registros
    ])

if __name__ == '__main__':
    app.run(debug=True)
