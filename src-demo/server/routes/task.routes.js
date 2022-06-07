const express = require('express');
const auth = require('../middleware/auth.middlware');
const { generateUserData } = require('../utils/helpers');
// Add validation to create and update USER resource
const { validate, taskValidations } = require('../utils/validations');
const { validationResult, body } = require('express-validator');

const router = express.Router({ mergeParams: true });
const app = require('../app.js');
const {
	getDoc,
	setDoc,
	query: q,
	where,
	limit,
	doc,
	getDocs,
	collection,
} = require('firebase/firestore');

const resource = 'tasks';

router.get('/:id?', [
	auth,
	async (req, res) => {
		try {
			const dataProvider = app.provider;
			const query = req.headers['providerrequest'];
			const params = JSON.parse(req.headers['providerparams']);

			const firestore = app.firestore;
			const tasksSnap = await firestore.collection(resource).get();
			const total = tasksSnap ? tasksSnap.size : 0;

			const {pagination,filter} = params;
			// Если идет запрос на все документы в коллекции подменяем количество запрашиваемых данных
			if (pagination?.perPage < 0)
				pagination.perPage = tasksSnap.size;
			if (Array.isArray(filter)) {
				const firestore = app.firestore;
				const colRef = collection(firestore, resource);
				const wheres = [];
				const items = [];
				let queryAddition = '';
				let search = null;
				filter.forEach((f) => {
					if (f.field !== 'q') {
						if (f.field === 'progress') {
							if (f.operator === '==') {
								queryAddition = 'progress_eq';
							} else {
								queryAddition = 'progress_neq';
							}
						} else {
							wheres.push(where(f.field, f.operator, f.value));
						}
					} else {
						search = unescape(f.value);
					}
				});

				if (wheres.length > 0) {
					const docRefs = q(colRef, ...wheres);
					const querySnapshot = await getDocs(docRefs);

					querySnapshot.forEach((doc) => {
						if (queryAddition != '') {
							if (
								(queryAddition === 'progress_eq' &&
									doc.data().progress === 100) ||
								(queryAddition === 'progress_neq' && doc.data().progress < 100)
							) {
								items.push(doc.data());
							}
						} else {
							items.push(doc.data());
						}
					});
				}

				if (search) {
					const colRef = collection(firestore, resource);
					const querySnapshot = await getDocs(colRef);
					querySnapshot.forEach((doc) => {
						if (items.filter((item) => item.id === doc.id).length === 0) {
							const data = doc.data();
							let isSearch = false;
							Object.keys(data).forEach((key) => {
								if (data[key].toString().search(search) > -1) isSearch = true;
							});
							if (isSearch) items.push(data);
						}
					});
				}
				
				const itemStart=(pagination.page-1)*pagination.perPage>items.length?items.length:(pagination.page-1)*pagination.perPage;
				const itemEnd=itemStart+pagination.perPage>items.length?items.length:itemStart+pagination.perPage;

				res
					.status(200)
					.send({
						data: items.slice(itemStart,itemEnd),
						total: items?.length,
					});
			} else {
				const { data } = await dataProvider[query](resource, params);
				res
					.status(200)
					.send({ data, total: query === 'getList' || query === 'getManyReference' ? total : data?.length });
			}
		} catch (e) {

			res.status(500).send({
				code: e.status === 200? 200: 500,
				name: 'ServerError',
				message: `На сервере произошла ошибка ${e.message}. Попробуйте позже`,
			});
		}
	},
]);

router.put('/:id?', [
  auth,
  validate(taskValidations),
  async (req, res) => {
    try {
      const dataProvider = app.provider;
      const query = req.body.headers.ProviderRequest;
      const params = JSON.parse(req.body.data);

      const { data } = await dataProvider[query](resource, params);
      res.status(200).send(data);
    } catch (e) {
      res.status(500).send({
        code: 500,
        name: 'ServerError',
        message: `На сервере произошла ошибка ${e.message}. Попробуйте позже`,
      });
    }
  },
]);

router.post('/', [
  auth,
  validate(taskValidations),
  async (req, res) => {
    try {
      console.log('route tasks');
      const dataProvider = app.provider;
      const query = req.body.headers.ProviderRequest;
      const params = JSON.parse(req.body.data);

      const { data } = await dataProvider[query](resource, params);
      res.status(200).send(data);
    } catch (e) {
      res.status(500).send({
        code: 500,
        name: 'ServerError',
        message: `На сервере произошла ошибка ${e.message}. Попробуйте позже`,
      });
    }
  },
]);

router.delete('/:id?', [
	auth,
	async (req, res) => {
		try {
			const dataProvider = app.provider;
			const query = req.headers['providerrequest'];
			const params = JSON.parse(req.headers['providerparams']);
			console.log(params, 'route tasks delete method');

			const { data } = await dataProvider[query](resource, params);
			res.status(200).send(data);
		} catch (e) {
			res.status(500).send({
				code: 500,
				name: 'ServerError',
				message: `На сервере произошла ошибка ${e.message}. Попробуйте позже`,
			});
		}
	},
]);

module.exports = router;
